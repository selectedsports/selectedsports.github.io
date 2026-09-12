import {
  reduceInningsState,
  validateDelivery,
  isBowlerEligible,
  computeMatchResult,
  DISMISSAL_TYPES,
  EXTRA_TYPES,
} from "./src/scoringEngine.js"

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failed++
  }
}

const mockSquad = [
  { id: "s1", display_name: "Batter 1", batting_order: 1 },
  { id: "s2", display_name: "Batter 2", batting_order: 2 },
  { id: "s3", display_name: "Batter 3", batting_order: 3 },
  { id: "s4", display_name: "Batter 4", batting_order: 4 },
  { id: "s5", display_name: "Batter 5", batting_order: 5 },
  { id: "b1", display_name: "Bowler 1" },
  { id: "b2", display_name: "Bowler 2" },
]

const baseConfig = {
  format: "T20",
  overs_per_innings: 20,
  balls_per_over: 6,
  players_per_side: 9,
  max_overs_per_bowler: 4,
  free_hit_enabled: true,
  wide_penalty: 1,
  noball_penalty: 1,
  byes_enabled: true,
  last_man_stands: false,
}

console.log("Running Acceptance Criteria Tests (AC-1 to AC-12)...")

// AC-1: Wide with 2 additional runs -> total +3, ball count does not advance, striker balls unchanged, bowler charged 3
{
  console.log("\nTesting AC-1 (Wide with 2 additional runs)...")
  const deliveries = [
    {
      id: "d1",
      bowler_id: "b1",
      striker_id: "s1",
      non_striker_id: "s2",
      runs_off_bat: 0,
      extra_type: EXTRA_TYPES.WIDE,
      extra_runs: 2,
    },
  ]
  const state = reduceInningsState(baseConfig, mockSquad, deliveries, {
    striker_id: "s1",
    non_striker_id: "s2",
    bowler_id: "b1",
  })
  assert(state.total_runs === 3, "Team total is 3")
  assert(state.legal_balls === 0, "Legal balls count is 0")
  assert(state.batter_stats["s1"].balls_faced === 0, "Striker balls faced is 0")
  assert(state.bowler_stats["b1"].runs_conceded === 3, "Bowler runs conceded is 3")
}

// AC-2: No-ball with 4 off bat -> total +5, striker 4 runs and 1 ball, ball count does not advance, bowler charged 5, free hit set
{
  console.log("\nTesting AC-2 (No-ball with 4 off bat)...")
  const deliveries = [
    {
      id: "d1",
      bowler_id: "b1",
      striker_id: "s1",
      non_striker_id: "s2",
      runs_off_bat: 4,
      extra_type: EXTRA_TYPES.NO_BALL,
      extra_runs: 0,
    },
  ]
  const state = reduceInningsState(baseConfig, mockSquad, deliveries, {
    striker_id: "s1",
    non_striker_id: "s2",
    bowler_id: "b1",
  })
  assert(state.total_runs === 5, "Team total is 5 (1 nb penalty + 4 bat)")
  assert(state.legal_balls === 0, "Legal balls count is 0")
  assert(state.batter_stats["s1"].runs === 4, "Striker credited 4 runs")
  assert(state.batter_stats["s1"].balls_faced === 1, "Striker credited 1 ball faced")
  assert(state.bowler_stats["b1"].runs_conceded === 5, "Bowler charged 5 runs")
  assert(state.is_free_hit === true, "Free hit flag is set")
}

// AC-3: 2 byes -> total +2, striker 1 ball 0 runs, bowler charged 0, ball count advances
{
  console.log("\nTesting AC-3 (2 Byes)...")
  const deliveries = [
    {
      id: "d1",
      bowler_id: "b1",
      striker_id: "s1",
      non_striker_id: "s2",
      runs_off_bat: 0,
      extra_type: EXTRA_TYPES.BYE,
      extra_runs: 2,
    },
  ]
  const state = reduceInningsState(baseConfig, mockSquad, deliveries, {
    striker_id: "s1",
    non_striker_id: "s2",
    bowler_id: "b1",
  })
  assert(state.total_runs === 2, "Team total is 2")
  assert(state.legal_balls === 1, "Legal balls count is 1")
  assert(state.batter_stats["s1"].balls_faced === 1, "Striker balls faced is 1")
  assert(state.batter_stats["s1"].runs === 0, "Striker runs is 0")
  assert(state.bowler_stats["b1"].runs_conceded === 0, "Bowler runs conceded is 0")
}

// AC-4: Over of six dot balls with two byes -> Maiden over recorded
{
  console.log("\nTesting AC-4 (Maiden over with byes)...")
  const deliveries = [
    { id: "d1", bowler_id: "b1", striker_id: "s1", non_striker_id: "s2", runs_off_bat: 0 },
    { id: "d2", bowler_id: "b1", striker_id: "s1", non_striker_id: "s2", runs_off_bat: 0, extra_type: EXTRA_TYPES.BYE, extra_runs: 2 },
    { id: "d3", bowler_id: "b1", striker_id: "s1", non_striker_id: "s2", runs_off_bat: 0 },
    { id: "d4", bowler_id: "b1", striker_id: "s1", non_striker_id: "s2", runs_off_bat: 0 },
    { id: "d5", bowler_id: "b1", striker_id: "s1", non_striker_id: "s2", runs_off_bat: 0 },
    { id: "d6", bowler_id: "b1", striker_id: "s1", non_striker_id: "s2", runs_off_bat: 0 },
  ]
  const state = reduceInningsState(baseConfig, mockSquad, deliveries, {
    striker_id: "s1",
    non_striker_id: "s2",
    bowler_id: "b1",
  })
  assert(state.legal_balls === 6, "Over is 6 balls")
  assert(state.bowler_stats["b1"].maidens === 1, "Bowler has 1 maiden")
  assert(state.overs[0].is_maiden === true, "Over 1 is marked maiden")
}

// AC-5: 3 runs -> strike swaps; over completes -> strike swaps again
{
  console.log("\nTesting AC-5 (Strike rotation on 3 runs & over completion)...")
  const del1 = [
    { id: "d1", bowler_id: "b1", striker_id: "s1", non_striker_id: "s2", runs_off_bat: 3 },
  ]
  const state1 = reduceInningsState(baseConfig, mockSquad, del1, {
    striker_id: "s1",
    non_striker_id: "s2",
    bowler_id: "b1",
  })
  assert(state1.striker_id === "s2" && state1.non_striker_id === "s1", "Strike swapped after 3 runs")

  // Over finishes (5 more dots)
  const del6 = [
    ...del1,
    { id: "d2", bowler_id: "b1", striker_id: "s2", non_striker_id: "s1", runs_off_bat: 0 },
    { id: "d3", bowler_id: "b1", striker_id: "s2", non_striker_id: "s1", runs_off_bat: 0 },
    { id: "d4", bowler_id: "b1", striker_id: "s2", non_striker_id: "s1", runs_off_bat: 0 },
    { id: "d5", bowler_id: "b1", striker_id: "s2", non_striker_id: "s1", runs_off_bat: 0 },
    { id: "d6", bowler_id: "b1", striker_id: "s2", non_striker_id: "s1", runs_off_bat: 0 },
  ]
  const state6 = reduceInningsState(baseConfig, mockSquad, del6, {
    striker_id: "s1",
    non_striker_id: "s2",
    bowler_id: "b1",
  })
  // At over end, strike swaps again from s2 to s1
  assert(state6.striker_id === "s1" && state6.non_striker_id === "s2", "Strike swapped back at over completion")
}

// AC-6: Free hit rejects Bowled, accepts Run out
{
  console.log("\nTesting AC-6 (Free hit dismissal restrictions)...")
  const currentState = {
    status: "in_progress",
    bowler_id: "b1",
    striker_id: "s1",
    non_striker_id: "s2",
    is_free_hit: true,
  }
  const bowledDelivery = { is_wicket: true, dismissal_type: DISMISSAL_TYPES.BOWLED, runs_off_bat: 0 }
  const runOutDelivery = { is_wicket: true, dismissal_type: DISMISSAL_TYPES.RUN_OUT, runs_off_bat: 0 }

  const bowledCheck = validateDelivery(bowledDelivery, currentState, baseConfig)
  assert(bowledCheck.valid === false, "Bowled is rejected on free hit")

  const runOutCheck = validateDelivery(runOutDelivery, currentState, baseConfig)
  assert(runOutCheck.valid === true, "Run out is accepted on free hit")
}

// AC-7: Run out with 1 run completed & non-striker dismissed
{
  console.log("\nTesting AC-7 (Run out with 1 run completed & non-striker dismissed)...")
  const deliveries = [
    {
      id: "d1",
      bowler_id: "b1",
      striker_id: "s1",
      non_striker_id: "s2",
      runs_off_bat: 1,
      is_wicket: true,
      dismissal_type: DISMISSAL_TYPES.RUN_OUT,
      dismissed_squad_id: "s2", // non-striker out
      incoming_batter_id: "s3",
    },
  ]
  const state = reduceInningsState(baseConfig, mockSquad, deliveries, {
    striker_id: "s1",
    non_striker_id: "s2",
    bowler_id: "b1",
  })
  assert(state.total_runs === 1, "Run counts (total is 1)")
  assert(state.total_wickets === 1, "Wicket counts (wickets is 1)")
  assert(state.batter_stats["s2"].is_out === true, "Non-striker s2 is marked out")
  assert(state.batter_stats["s1"].is_out === false, "Striker s1 is still in")
  // 1 run run -> strike swapped, then s2 out replaced by s3
  // Surviving batter is s1, incoming is s3.
  assert(state.striker_id === "s1" || state.non_striker_id === "s1", "Surviving batter s1 remains in crease")
}

// AC-8: Bowler who bowled previous over rejected; bowler at over limit rejected
{
  console.log("\nTesting AC-8 (Bowler consecutive and over limit restrictions)...")
  const currentState = {
    last_completed_over_bowler_id: "b1",
    bowler_stats: {
      b1: { balls_bowled: 6 },
      b2: { balls_bowled: 24 }, // 4 overs bowled (limit is 4)
    },
  }
  assert(!isBowlerEligible("b1", currentState, baseConfig), "Bowler of last over b1 is rejected")
  assert(!isBowlerEligible("b2", currentState, baseConfig), "Bowler at limit b2 is rejected")
}

// AC-9: Target 150 reached at 150 with 4 wickets lost, 7 balls remaining for 9-a-side match -> "won by 5 wickets (7 balls remaining)"
{
  console.log("\nTesting AC-9 (Chasing team target calculation)...")
  const inn1 = { total_runs: 149, batting_team_id: "t1" }
  const inn2 = {
    total_runs: 150,
    total_wickets: 4,
    legal_balls: 113, // 120 - 7 balls remaining
    overs_limit: 20,
    batting_team_id: "t2",
    target: 150,
  }
  const result = computeMatchResult(
    { players_per_side: 9, balls_per_over: 6 },
    { id: "t1", name: "Team A" },
    { id: "t2", name: "Team B" },
    inn1,
    inn2
  )
  assert(result.result_type === "win_by_wickets", "Result type is win_by_wickets")
  assert(result.margin_value === 4, "Wickets remaining is 4 (9 - 1 - 4 = 4)")
  assert(result.balls_remaining === 7, "Balls remaining is 7")
  assert(result.result_text.includes("won by 4 wickets (7 balls remaining)"), `Result string: ${result.result_text}`)
}

// AC-10: Equal totals -> tie
{
  console.log("\nTesting AC-10 (Tied match result)...")
  const inn1 = { total_runs: 150, batting_team_id: "t1" }
  const inn2 = { total_runs: 150, total_wickets: 8, status: "complete", batting_team_id: "t2", target: 151 }
  const result = computeMatchResult(
    { players_per_side: 9, balls_per_over: 6 },
    { id: "t1", name: "Team A" },
    { id: "t2", name: "Team B" },
    inn1,
    inn2
  )
  assert(result.result_type === "tie", "Result type is tie")
  assert(result.result_text === "Match tied", "Result text is 'Match tied'")
}

// AC-11: Determinism (same delivery list twice -> byte-identical state)
{
  console.log("\nTesting AC-11 (Deterministic reduction)...")
  const deliveries = [
    { id: "d1", bowler_id: "b1", striker_id: "s1", non_striker_id: "s2", runs_off_bat: 1 },
    { id: "d2", bowler_id: "b1", striker_id: "s2", non_striker_id: "s1", runs_off_bat: 4 },
    { id: "d3", bowler_id: "b1", striker_id: "s2", non_striker_id: "s1", runs_off_bat: 0, extra_type: EXTRA_TYPES.WIDE, extra_runs: 1 },
  ]
  const stateA = reduceInningsState(baseConfig, mockSquad, deliveries, { striker_id: "s1", non_striker_id: "s2", bowler_id: "b1" })
  const stateB = reduceInningsState(baseConfig, mockSquad, deliveries, { striker_id: "s1", non_striker_id: "s2", bowler_id: "b1" })
  assert(JSON.stringify(stateA) === JSON.stringify(stateB), "Both runs produced identical JSON state")
}

// AC-12: Undo after wicket restores previous batter, balls, runs, bowler wickets, fall of wickets
{
  console.log("\nTesting AC-12 (Undo after wicket restores previous state)...")
  const d1 = { id: "d1", bowler_id: "b1", striker_id: "s1", non_striker_id: "s2", runs_off_bat: 1 }
  const d2Wicket = {
    id: "d2",
    bowler_id: "b1",
    striker_id: "s2",
    non_striker_id: "s1",
    runs_off_bat: 0,
    is_wicket: true,
    dismissal_type: DISMISSAL_TYPES.BOWLED,
    dismissed_squad_id: "s2",
    incoming_batter_id: "s3",
  }
  
  // State before wicket
  const stateBefore = reduceInningsState(baseConfig, mockSquad, [d1], { striker_id: "s1", non_striker_id: "s2", bowler_id: "b1" })
  // State with wicket
  const stateWithWicket = reduceInningsState(baseConfig, mockSquad, [d1, d2Wicket], { striker_id: "s1", non_striker_id: "s2", bowler_id: "b1" })
  assert(stateWithWicket.total_wickets === 1, "Wicket is 1")
  assert(stateWithWicket.fall_of_wickets.length === 1, "Fall of wickets has 1 entry")

  // Undo (removing d2Wicket)
  const stateAfterUndo = reduceInningsState(baseConfig, mockSquad, [d1], { striker_id: "s1", non_striker_id: "s2", bowler_id: "b1" })
  assert(stateAfterUndo.total_wickets === 0, "Wickets restored to 0")
  assert(stateAfterUndo.batter_stats["s2"].is_out === false, "Batter s2 is not out")
  assert(stateAfterUndo.fall_of_wickets.length === 0, "Fall of wickets is empty")
  assert(stateAfterUndo.bowler_stats["b1"].wickets === 0, "Bowler wickets restored to 0")
  assert(JSON.stringify(stateAfterUndo) === JSON.stringify(stateBefore), "State matches exactly prior to wicket")
}

console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed.`)
if (failed > 0) process.exit(1)
