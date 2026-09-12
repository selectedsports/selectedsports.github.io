/**
 * Selected Sports - Pure Deterministic Cricket Scoring Engine
 * Adheres to MCC Laws of Cricket (2017 Code, 3rd Edition 2022)
 * Implements Business Rules BR-1 to BR-20 and Architectural Decision AD-1.
 * Pure reducer: no side effects, no random/network/time dependencies.
 */

export const DISMISSAL_TYPES = {
  BOWLED: "bowled",
  CAUGHT: "caught",
  CAUGHT_AND_BOWLED: "caught_and_bowled",
  LBW: "lbw",
  RUN_OUT: "run_out",
  STUMPED: "stumped",
  HIT_WICKET: "hit_wicket",
  RETIRED_HURT: "retired_hurt",
  RETIRED_OUT: "retired_out",
  OBSTRUCTING_FIELD: "obstructing_field",
  TIMED_OUT: "timed_out",
  HANDLED_BALL: "handled_ball",
}

export const EXTRA_TYPES = {
  NONE: "none",
  WIDE: "wide",
  NO_BALL: "no_ball",
  BYE: "bye",
  LEG_BYE: "leg_bye",
  PENALTY: "penalty",
}

export const MATCH_FORMATS = {
  T10: { name: "T10", overs: 10, ballsPerOver: 6, maxOversPerBowler: 2 },
  T20: { name: "T20", overs: 20, ballsPerOver: 6, maxOversPerBowler: 4 },
  ODI: { name: "ODI", overs: 50, ballsPerOver: 6, maxOversPerBowler: 10 },
  CUSTOM: { name: "Custom", overs: 20, ballsPerOver: 6, maxOversPerBowler: 4 },
}

export const DEFAULT_CONFIG = {
  format: "T20",
  overs_per_innings: 20,
  balls_per_over: 6,
  players_per_side: 11,
  max_overs_per_bowler: 4,
  free_hit_enabled: true,
  wide_penalty: 1,
  noball_penalty: 1,
  byes_enabled: true,
  last_man_stands: false,
  public_link_enabled: true,
  scoring_status: "pending",
}

/**
 * Validates a candidate delivery against cricket scoring rules (BR-1 to BR-19).
 * Returns { valid: boolean, error?: string }
 */
export function validateDelivery(delivery, currentState, config = DEFAULT_CONFIG) {
  if (!currentState || currentState.status === "complete") {
    return { valid: false, error: "Innings is already complete or not started." }
  }

  // Bowler must be set
  if (!currentState.bowler_id) {
    return { valid: false, error: "No bowler currently selected." }
  }

  // Striker & Non-striker must be set
  if (!currentState.striker_id || !currentState.non_striker_id) {
    return { valid: false, error: "Both striker and non-striker must be selected." }
  }

  if (currentState.striker_id === currentState.non_striker_id) {
    return { valid: false, error: "Striker and non-striker cannot be the same player." }
  }

  // Free hit restriction (BR-11, FR-8.13)
  if (currentState.is_free_hit && delivery.is_wicket) {
    const allowedFreeHitDismissals = [
      DISMISSAL_TYPES.RUN_OUT,
      DISMISSAL_TYPES.STUMPED,
      DISMISSAL_TYPES.OBSTRUCTING_FIELD,
    ]
    if (!allowedFreeHitDismissals.includes(delivery.dismissal_type)) {
      return {
        valid: false,
        error: `Only Run out, Stumped, or Obstructing the field are permitted on a Free Hit. '${delivery.dismissal_type}' is not allowed.`,
      }
    }
  }

  // Runs off bat range check
  const runsOffBat = Number(delivery.runs_off_bat || 0)
  if (runsOffBat < 0 || runsOffBat > 8) {
    return { valid: false, error: "Runs off the bat must be between 0 and 8." }
  }

  return { valid: true }
}

/**
 * Evaluates bowler eligibility for next over (BR-19, FR-8.8).
 */
export function isBowlerEligible(bowlerSquadId, currentInningsState, config, squadList = []) {
  if (!bowlerSquadId) return false
  const maxOvers = config?.max_overs_per_bowler || Math.ceil((config?.overs_per_innings || 20) / 5)

  // Cannot bowl two consecutive overs (BR-19)
  if (currentInningsState?.last_completed_over_bowler_id === bowlerSquadId) {
    return false
  }

  // Cannot exceed maximum overs per bowler
  const bowlerStats = currentInningsState?.bowler_stats?.[bowlerSquadId]
  if (bowlerStats) {
    const ballsBowled = bowlerStats.balls_bowled || 0
    const bpo = config?.balls_per_over || 6
    const completedOvers = Math.floor(ballsBowled / bpo)
    if (completedOvers >= maxOvers) {
      return false
    }
  }

  return true
}

/**
 * Pure Reducer: Reduces an ordered array of deliveries into complete innings state.
 * (AD-1, BR-1 to BR-20)
 *
 * @param {Object} config - Scoring configuration
 * @param {Array} squad - Array of match_squad entries for both sides
 * @param {Array} deliveries - Chronological array of deliveries
 * @param {Object} initialInningsInfo - { batting_team_id, bowling_team_id, target, overs_limit }
 * @returns {Object} Complete Innings State
 */
export function reduceInningsState(config = DEFAULT_CONFIG, squad = [], deliveries = [], initialInningsInfo = {}) {
  const ballsPerOver = Number(config.balls_per_over || 6)
  const oversLimit = Number(initialInningsInfo.overs_limit || config.overs_per_innings || 20)
  const totalBallsLimit = oversLimit * ballsPerOver
  const playersPerSide = Number(config.players_per_side || 11)
  const maxWickets = config.last_man_stands ? playersPerSide : playersPerSide - 1
  const target = initialInningsInfo.target ? Number(initialInningsInfo.target) : null

  // Squad lookup map
  const squadMap = {}
  squad.forEach(s => {
    squadMap[s.id] = s
  })

  // Innings State Accumulator
  const state = {
    batting_team_id: initialInningsInfo.batting_team_id || null,
    bowling_team_id: initialInningsInfo.bowling_team_id || null,
    target,
    overs_limit: oversLimit,
    total_runs: 0,
    total_wickets: 0,
    legal_balls: 0,
    current_over_no: 0,
    ball_in_over: 0,
    striker_id: initialInningsInfo.striker_id || null,
    non_striker_id: initialInningsInfo.non_striker_id || null,
    bowler_id: initialInningsInfo.bowler_id || null,
    last_completed_over_bowler_id: null,
    is_free_hit: false,
    status: "in_progress", // pending, in_progress, awaiting_batter, awaiting_bowler, complete
    ended_reason: null,
    is_revised: Boolean(initialInningsInfo.is_revised),
    
    // Extras totals
    extras: {
      wide: 0,
      noball: 0,
      bye: 0,
      legbye: 0,
      penalty: 0,
      total: 0,
    },

    // Current partnership
    current_partnership: {
      runs: 0,
      balls: 0,
    },

    // Batter statistics keyed by squad_id
    batter_stats: {},

    // Bowler statistics keyed by squad_id
    bowler_stats: {},

    // Over-by-over analysis
    overs: [], // array of { over_no, bowler_id, balls: [], runs_conceded: 0, is_maiden: false }
    current_over_deliveries: [],

    // Fall of wickets
    fall_of_wickets: [], // array of { wicket_no, runs, balls, over_str, batter_id, batter_name }

    // Commentary feed
    commentary: [],

    // Active deliveries audit (non-superseded)
    active_deliveries: [],
  }

  // Initialize all squad members in batting/bowling maps
  squad.forEach(s => {
    state.batter_stats[s.id] = {
      squad_id: s.id,
      player_id: s.player_id,
      name: s.display_name,
      runs: 0,
      balls_faced: 0,
      fours: 0,
      sixes: 0,
      strike_rate: null,
      is_out: false,
      dismissal_type: null,
      dismissal_text: "not out",
      bowler_id: null,
      fielder_id: null,
      batting_order: s.batting_order ?? 999,
    }

    state.bowler_stats[s.id] = {
      squad_id: s.id,
      player_id: s.player_id,
      name: s.display_name,
      overs_bowled_str: "0.0",
      balls_bowled: 0,
      maidens: 0,
      runs_conceded: 0,
      wickets: 0,
      economy: null,
      wides: 0,
      noballs: 0,
    }
  })

  // Filter out superseded deliveries (AD-2 append-only supersede)
  const validDeliveries = deliveries.filter(d => !d.superseded_by)

  let currentOverObj = {
    over_no: 0,
    bowler_id: state.bowler_id,
    deliveries: [],
    legal_balls_in_over: 0,
    bowler_runs_conceded: 0,
  }

  for (let i = 0; i < validDeliveries.length; i++) {
    const del = validDeliveries[i]
    state.active_deliveries.push(del)

    // Set active bowler/batters from delivery record
    state.bowler_id = del.bowler_id
    state.striker_id = del.striker_id
    state.non_striker_id = del.non_striker_id

    const extraType = del.extra_type || EXTRA_TYPES.NONE
    const runsOffBat = Number(del.runs_off_bat || 0)
    const extraRuns = Number(del.extra_runs || 0)
    const isLegal = extraType !== EXTRA_TYPES.WIDE && extraType !== EXTRA_TYPES.NO_BALL // BR-1
    const widePenalty = Number(config.wide_penalty ?? 1)
    const noballPenalty = Number(config.noball_penalty ?? 1)

    let totalBallRuns = 0
    let runsForBowler = 0
    let runsRunPhysically = 0

    // Ensure stats objects exist
    if (!state.batter_stats[del.striker_id]) {
      state.batter_stats[del.striker_id] = {
        squad_id: del.striker_id,
        name: squadMap[del.striker_id]?.display_name || "Batter",
        runs: 0, balls_faced: 0, fours: 0, sixes: 0, is_out: false, dismissal_text: "not out"
      }
    }
    if (!state.bowler_stats[del.bowler_id]) {
      state.bowler_stats[del.bowler_id] = {
        squad_id: del.bowler_id,
        name: squadMap[del.bowler_id]?.display_name || "Bowler",
        balls_bowled: 0, maidens: 0, runs_conceded: 0, wickets: 0, wides: 0, noballs: 0
      }
    }

    const strikerStats = state.batter_stats[del.striker_id]
    const bowlerStats = state.bowler_stats[del.bowler_id]

    // Apply delivery specifics by extra type
    if (extraType === EXTRA_TYPES.WIDE) {
      // BR-2: Wide adds wide_penalty + extraRuns run
      const wideTotal = widePenalty + extraRuns
      totalBallRuns += wideTotal
      state.extras.wide += wideTotal
      state.extras.total += wideTotal
      bowlerStats.runs_conceded += wideTotal
      bowlerStats.wides += 1
      runsForBowler += wideTotal
      runsRunPhysically = extraRuns
      // Striker faces no ball, credited no runs
    } else if (extraType === EXTRA_TYPES.NO_BALL) {
      // BR-3: No-ball adds noball_penalty + runs_off_bat + extraRuns
      const nbTotal = noballPenalty + runsOffBat + extraRuns
      totalBallRuns += nbTotal
      state.extras.noball += noballPenalty
      state.extras.total += noballPenalty
      strikerStats.runs += runsOffBat
      strikerStats.balls_faced += 1 // Striker is credited with ball faced per BR-3
      if (runsOffBat === 4) strikerStats.fours += 1
      if (runsOffBat === 6) strikerStats.sixes += 1
      bowlerStats.runs_conceded += (noballPenalty + runsOffBat + extraRuns)
      bowlerStats.noballs += 1
      runsForBowler += (noballPenalty + runsOffBat + extraRuns)
      runsRunPhysically = runsOffBat + extraRuns
      // Free hit flag for NEXT delivery if enabled
      state.is_free_hit = Boolean(config.free_hit_enabled)
    } else if (extraType === EXTRA_TYPES.BYE) {
      // BR-4: Bye runs added to team extras. Striker faces ball, 0 bat runs. Bowler not charged.
      totalBallRuns += extraRuns
      state.extras.bye += extraRuns
      state.extras.total += extraRuns
      strikerStats.balls_faced += 1
      runsRunPhysically = extraRuns
      state.is_free_hit = false
    } else if (extraType === EXTRA_TYPES.LEG_BYE) {
      // BR-5: Leg-bye
      totalBallRuns += extraRuns
      state.extras.legbye += extraRuns
      state.extras.total += extraRuns
      strikerStats.balls_faced += 1
      runsRunPhysically = extraRuns
      state.is_free_hit = false
    } else if (extraType === EXTRA_TYPES.PENALTY) {
      // BR-6: Penalty runs
      totalBallRuns += extraRuns
      state.extras.penalty += extraRuns
      state.extras.total += extraRuns
      state.is_free_hit = false
    } else {
      // Regular delivery off the bat
      totalBallRuns += runsOffBat
      strikerStats.runs += runsOffBat
      strikerStats.balls_faced += 1
      if (runsOffBat === 4) strikerStats.fours += 1
      if (runsOffBat === 6) strikerStats.sixes += 1
      bowlerStats.runs_conceded += runsOffBat
      runsForBowler += runsOffBat
      runsRunPhysically = runsOffBat
      state.is_free_hit = false
    }

    // Team runs and partnership
    state.total_runs += totalBallRuns
    state.current_partnership.runs += totalBallRuns

    // Legal ball advancement
    if (isLegal) {
      state.legal_balls += 1
      state.current_partnership.balls += 1
      bowlerStats.balls_bowled += 1
      currentOverObj.legal_balls_in_over += 1
    }

    currentOverObj.bowler_runs_conceded += runsForBowler
    currentOverObj.deliveries.push(del)
    state.current_over_deliveries.push(del)

    // Handle Wicket (BR-10)
    let strikeRotatedAfterWicket = false
    if (del.is_wicket) {
      state.total_wickets += 1
      const dismissedId = del.dismissed_squad_id || del.striker_id
      const dismissedStats = state.batter_stats[dismissedId]
      const dismissalType = del.dismissal_type || DISMISSAL_TYPES.BOWLED

      if (dismissedStats) {
        dismissedStats.is_out = true
        dismissedStats.dismissal_type = dismissalType
        dismissedStats.bowler_id = del.bowler_id
        dismissedStats.fielder_id = del.fielder_squad_id || null

        // Format human dismissal text
        const bowlerName = squadMap[del.bowler_id]?.display_name || "Bowler"
        const fielderName = del.fielder_squad_id ? squadMap[del.fielder_squad_id]?.display_name : null

        if (dismissalType === DISMISSAL_TYPES.BOWLED) {
          dismissedStats.dismissal_text = `b ${bowlerName}`
        } else if (dismissalType === DISMISSAL_TYPES.CAUGHT) {
          dismissedStats.dismissal_text = fielderName ? `c ${fielderName} b ${bowlerName}` : `c & b ${bowlerName}`
        } else if (dismissalType === DISMISSAL_TYPES.CAUGHT_AND_BOWLED) {
          dismissedStats.dismissal_text = `c & b ${bowlerName}`
        } else if (dismissalType === DISMISSAL_TYPES.LBW) {
          dismissedStats.dismissal_text = `lbw b ${bowlerName}`
        } else if (dismissalType === DISMISSAL_TYPES.RUN_OUT) {
          dismissedStats.dismissal_text = fielderName ? `run out (${fielderName})` : `run out`
        } else if (dismissalType === DISMISSAL_TYPES.STUMPED) {
          dismissedStats.dismissal_text = fielderName ? `st ${fielderName} b ${bowlerName}` : `st b ${bowlerName}`
        } else if (dismissalType === DISMISSAL_TYPES.HIT_WICKET) {
          dismissedStats.dismissal_text = `hit wicket b ${bowlerName}`
        } else {
          dismissedStats.dismissal_text = dismissalType.replace(/_/g, " ")
        }
      }

      // Bowler credit (BR-10)
      const creditedToBowler = [
        DISMISSAL_TYPES.BOWLED,
        DISMISSAL_TYPES.CAUGHT,
        DISMISSAL_TYPES.CAUGHT_AND_BOWLED,
        DISMISSAL_TYPES.LBW,
        DISMISSAL_TYPES.STUMPED,
        DISMISSAL_TYPES.HIT_WICKET,
      ].includes(dismissalType)

      if (creditedToBowler) {
        bowlerStats.wickets += 1
      }

      // Record Fall of Wicket
      const completedOversNow = Math.floor(state.legal_balls / ballsPerOver)
      const ballsInOverNow = state.legal_balls % ballsPerOver
      const overStr = `${completedOversNow}.${ballsInOverNow}`

      state.fall_of_wickets.push({
        wicket_no: state.total_wickets,
        runs: state.total_runs,
        balls: state.legal_balls,
        over_str: overStr,
        batter_id: dismissedId,
        batter_name: squadMap[dismissedId]?.display_name || "Batter",
      })

      // Reset current partnership for next wicket
      state.current_partnership = { runs: 0, balls: 0 }

      // Check run out strike rotation (FR-8.5, BR-9)
      if (dismissalType === DISMISSAL_TYPES.RUN_OUT) {
        // Runs completed before run out
        if (runsRunPhysically % 2 !== 0) {
          // Odd runs run before run-out
          const temp = state.striker_id
          state.striker_id = state.non_striker_id
          state.non_striker_id = temp
          strikeRotatedAfterWicket = true
        }
      }

      // Vacate dismissed batter position
      if (dismissedId === state.striker_id) {
        state.striker_id = del.incoming_batter_id || null
      } else if (dismissedId === state.non_striker_id) {
        state.non_striker_id = del.incoming_batter_id || null
      }

      if (!del.incoming_batter_id && state.total_wickets < maxWickets) {
        state.status = "awaiting_batter"
      }
    }

    // Strike rotation on runs run (BR-9)
    if (!strikeRotatedAfterWicket && runsRunPhysically % 2 !== 0) {
      const temp = state.striker_id
      state.striker_id = state.non_striker_id
      state.non_striker_id = temp
    }

    // Check Over Completion (BR-1, BR-9, BR-19)
    if (isLegal && currentOverObj.legal_balls_in_over === ballsPerOver) {
      // Over finished!
      const isMaiden = currentOverObj.bowler_runs_conceded === 0 // BR-8
      if (isMaiden) {
        bowlerStats.maidens += 1
      }

      state.overs.push({
        over_no: state.current_over_no,
        bowler_id: del.bowler_id,
        deliveries: [...currentOverObj.deliveries],
        runs_conceded: currentOverObj.bowler_runs_conceded,
        is_maiden: isMaiden,
      })

      state.last_completed_over_bowler_id = del.bowler_id
      state.current_over_no += 1
      state.current_over_deliveries = []

      // Strike swaps at end of over (BR-9)
      const temp = state.striker_id
      state.striker_id = state.non_striker_id
      state.non_striker_id = temp

      // Reset over tracker
      currentOverObj = {
        over_no: state.current_over_no,
        bowler_id: null,
        deliveries: [],
        legal_balls_in_over: 0,
        bowler_runs_conceded: 0,
      }

      if (state.legal_balls < totalBallsLimit && state.total_wickets < maxWickets) {
        state.status = "awaiting_bowler"
      }
    }

    // Generate commentary line (FR-8.16)
    const curCompletedOvers = Math.floor(state.legal_balls / ballsPerOver)
    const curBallInOver = isLegal ? (state.legal_balls % ballsPerOver || ballsPerOver) : (state.legal_balls % ballsPerOver)
    const overDisplay = isLegal ? `${Math.floor((state.legal_balls - 1) / ballsPerOver)}.${(state.legal_balls - 1) % ballsPerOver + 1}` : `${curCompletedOvers}.${curBallInOver}`
    const bowlerName = squadMap[del.bowler_id]?.display_name || "Bowler"
    const strikerName = squadMap[del.striker_id]?.display_name || "Striker"

    let outcomeText = ""
    if (del.is_wicket) {
      outcomeText = `OUT! (${del.dismissal_type?.replace(/_/g, " ")})`
    } else if (extraType === EXTRA_TYPES.WIDE) {
      outcomeText = extraRuns > 0 ? `Wide + ${extraRuns} runs` : "Wide"
    } else if (extraType === EXTRA_TYPES.NO_BALL) {
      outcomeText = runsOffBat > 0 ? `No Ball, ${runsOffBat} runs` : "No Ball"
    } else if (extraType === EXTRA_TYPES.BYE) {
      outcomeText = `${extraRuns} Byes`
    } else if (extraType === EXTRA_TYPES.LEG_BYE) {
      outcomeText = `${extraRuns} Leg Byes`
    } else if (runsOffBat === 0) {
      outcomeText = "dot ball"
    } else if (runsOffBat === 4) {
      outcomeText = "FOUR!"
    } else if (runsOffBat === 6) {
      outcomeText = "SIX!"
    } else {
      outcomeText = `${runsOffBat} run${runsOffBat > 1 ? "s" : ""}`
    }

    state.commentary.push({
      over_ball: overDisplay,
      line: `${overDisplay} — ${bowlerName} to ${strikerName}, ${outcomeText}`,
      delivery_id: del.id || del.client_uuid,
    })

    // Check Innings End Condition (BR-12)
    const allOut = state.total_wickets >= maxWickets
    const oversComplete = state.legal_balls >= totalBallsLimit
    const targetReached = target !== null && state.total_runs >= target

    if (allOut || oversComplete || targetReached) {
      state.status = "complete"
      if (targetReached) state.ended_reason = "target_reached"
      else if (allOut) state.ended_reason = "all_out"
      else if (oversComplete) state.ended_reason = "overs_completed"
      break
    }
  }

  // Update over formatting & economy for bowlers
  Object.values(state.bowler_stats).forEach(b => {
    const fullOvers = Math.floor(b.balls_bowled / ballsPerOver)
    const remBalls = b.balls_bowled % ballsPerOver
    b.overs_bowled_str = `${fullOvers}.${remBalls}`
    if (b.balls_bowled > 0) {
      // BR-16 Economy
      const oversFraction = b.balls_bowled / ballsPerOver
      b.economy = (b.runs_conceded / oversFraction).toFixed(2)
    } else {
      b.economy = "—"
    }
  })

  // Update strike rates for batters (BR-16)
  Object.values(state.batter_stats).forEach(bat => {
    if (bat.balls_faced > 0) {
      bat.strike_rate = ((bat.runs / bat.balls_faced) * 100).toFixed(1)
    } else {
      bat.strike_rate = "—"
    }
  })

  // Final ball in over tracker
  state.ball_in_over = state.legal_balls % ballsPerOver

  return state
}

/**
 * Computes Match Result according to Business Rule BR-14.
 */
export function computeMatchResult(config = DEFAULT_CONFIG, teamA, teamB, innings1State, innings2State) {
  if (!innings1State || !innings2State) {
    return {
      result_type: "in_progress",
      result_text: "Match in progress",
      winning_team_id: null,
      margin_value: null,
      margin_unit: null,
      balls_remaining: null,
    }
  }

  const inn1Runs = innings1State.total_runs || 0
  const inn2Runs = innings2State.total_runs || 0
  const target = innings2State.target || (inn1Runs + 1)
  const playersPerSide = Number(config.players_per_side || 11)
  const ballsPerOver = Number(config.balls_per_over || 6)
  const totalBalls = Number(innings2State.overs_limit || config.overs_per_innings || 20) * ballsPerOver
  const ballsRemaining = Math.max(0, totalBalls - (innings2State.legal_balls || 0))

  const chasingTeamId = innings2State.batting_team_id
  const defendingTeamId = innings1State.batting_team_id

  const chasingTeamName = (chasingTeamId === teamA?.id ? teamA?.name : teamB?.name) || "Chasing Team"
  const defendingTeamName = (defendingTeamId === teamA?.id ? teamA?.name : teamB?.name) || "Defending Team"

  // Chasing team reached or exceeded target
  if (inn2Runs >= target) {
    const wicketsLost = innings2State.total_wickets || 0
    const wicketsRemaining = Math.max(0, playersPerSide - 1 - wicketsLost)

    return {
      result_type: "win_by_wickets",
      winning_team_id: chasingTeamId,
      margin_value: wicketsRemaining,
      margin_unit: "wickets",
      balls_remaining: ballsRemaining,
      result_text: `${chasingTeamName} won by ${wicketsRemaining} wickets (${ballsRemaining} balls remaining)`,
    }
  }

  // Chasing team innings ended below target
  if (innings2State.status === "complete") {
    if (inn2Runs === inn1Runs) {
      return {
        result_type: "tie",
        winning_team_id: null,
        margin_value: 0,
        margin_unit: "runs",
        balls_remaining: ballsRemaining,
        result_text: "Match tied",
      }
    } else if (inn2Runs < target - 1) {
      const runMargin = target - 1 - inn2Runs
      return {
        result_type: "win_by_runs",
        winning_team_id: defendingTeamId,
        margin_value: runMargin,
        margin_unit: "runs",
        balls_remaining: ballsRemaining,
        result_text: `${defendingTeamName} won by ${runMargin} runs`,
      }
    }
  }

  return {
    result_type: "in_progress",
    result_text: "Match in progress",
    winning_team_id: null,
    margin_value: null,
    margin_unit: null,
    balls_remaining: ballsRemaining,
  }
}

/**
 * Calculates Man of the Match advisory ranking score according to BR-15.
 * impact = runs + (20 * wickets) + (10 * catches) + (10 * run_outs) + (10 * stumpings)
 * Ties broken by strike rate, then economy.
 */
export function calculateImpactScore(playerMatchStats) {
  const runs = Number(playerMatchStats.runs || 0)
  const wickets = Number(playerMatchStats.wickets || 0)
  const catches = Number(playerMatchStats.catches || 0)
  const runOuts = Number(playerMatchStats.run_outs || 0)
  const stumpings = Number(playerMatchStats.stumpings || 0)

  const impact = runs + (20 * wickets) + (10 * catches) + (10 * runOuts) + (10 * stumpings)

  const strikeRate = playerMatchStats.balls_faced > 0
    ? (runs / playerMatchStats.balls_faced) * 100
    : 0

  const economy = playerMatchStats.balls_bowled > 0
    ? (playerMatchStats.runs_conceded / (playerMatchStats.balls_bowled / 6))
    : 999 // lower economy is better

  return {
    impact,
    strikeRate,
    economy,
  }
}

/**
 * Aggregates match statistics per player from innings 1 & 2 for persistent storage.
 */
export function aggregateMatchPlayerStats(matchId, squad = [], innings1State, innings2State) {
  const statsMap = {}

  squad.forEach(s => {
    statsMap[s.id] = {
      match_id: matchId,
      player_id: s.player_id,
      squad_id: s.id,
      name: s.display_name,
      is_linked: s.is_linked,
      runs: 0,
      balls_faced: 0,
      fours: 0,
      sixes: 0,
      is_out: false,
      dismissal_type: null,
      overs_bowled: 0,
      balls_bowled: 0,
      maidens: 0,
      runs_conceded: 0,
      wickets: 0,
      catches: 0,
      run_outs: 0,
      stumpings: 0,
      impact_score: 0,
    }
  })

  const processInnings = (innState) => {
    if (!innState) return
    // Batting
    Object.values(innState.batter_stats || {}).forEach(b => {
      const target = statsMap[b.squad_id]
      if (target) {
        target.runs += b.runs
        target.balls_faced += b.balls_faced
        target.fours += b.fours
        target.sixes += b.sixes
        if (b.is_out) {
          target.is_out = true
          target.dismissal_type = b.dismissal_type
        }
      }
    })
    // Bowling
    Object.values(innState.bowler_stats || {}).forEach(bw => {
      const target = statsMap[bw.squad_id]
      if (target) {
        target.balls_bowled += bw.balls_bowled
        target.maidens += bw.maidens
        target.runs_conceded += bw.runs_conceded
        target.wickets += bw.wickets
        target.overs_bowled = Math.floor(target.balls_bowled / 6) + (target.balls_bowled % 6) / 10
      }
    })
    // Fielding
    ;(innState.active_deliveries || []).forEach(d => {
      if (d.is_wicket && d.fielder_squad_id && statsMap[d.fielder_squad_id]) {
        if (d.dismissal_type === DISMISSAL_TYPES.CAUGHT || d.dismissal_type === DISMISSAL_TYPES.CAUGHT_AND_BOWLED) {
          statsMap[d.fielder_squad_id].catches += 1
        } else if (d.dismissal_type === DISMISSAL_TYPES.RUN_OUT) {
          statsMap[d.fielder_squad_id].run_outs += 1
        } else if (d.dismissal_type === DISMISSAL_TYPES.STUMPED) {
          statsMap[d.fielder_squad_id].stumpings += 1
        }
      }
    })
  }

  processInnings(innings1State)
  processInnings(innings2State)

  // Compute impact score
  Object.values(statsMap).forEach(s => {
    const { impact } = calculateImpactScore(s)
    s.impact_score = impact
  })

  return Object.values(statsMap)
}
