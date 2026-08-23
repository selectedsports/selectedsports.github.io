import { useState, useEffect, useRef } from "react"

// Circular crop/reposition/zoom tool. Renders a live preview canvas the user can
// drag to pan and use a slider to zoom, then exports a cropped square JPEG.
export default function PhotoCropModal({ imageSrc, onCancel, onSave }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [ready, setReady] = useState(false)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const SIZE = 280
  const OUTPUT_SIZE = 480

  useEffect(() => {
    const img = new Image()
    img.onload = () => { imgRef.current = img; setReady(true) }
    img.src = imageSrc
  }, [imageSrc])

  const draw = () => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, SIZE, SIZE)
    ctx.save()
    ctx.beginPath()
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2)
    ctx.clip()
    const baseScale = Math.max(SIZE / img.width, SIZE / img.height)
    const scale = baseScale * zoom
    const w = img.width * scale, h = img.height * scale
    const x = SIZE / 2 - w / 2 + offset.x
    const y = SIZE / 2 - h / 2 + offset.y
    ctx.drawImage(img, x, y, w, h)
    ctx.restore()
    ctx.strokeStyle = "#166534"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1.5, 0, Math.PI * 2)
    ctx.stroke()
  }

  useEffect(() => { if (ready) draw() }, [ready, zoom, offset])

  const startDrag = (x, y) => { dragging.current = true; lastPos.current = { x, y } }
  const moveDrag = (x, y) => {
    if (!dragging.current) return
    const dx = x - lastPos.current.x, dy = y - lastPos.current.y
    lastPos.current = { x, y }
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
  }
  const endDrag = () => { dragging.current = false }

  const save = () => {
    const img = imgRef.current
    const out = document.createElement("canvas")
    out.width = OUTPUT_SIZE; out.height = OUTPUT_SIZE
    const ctx = out.getContext("2d")
    ctx.save()
    ctx.beginPath()
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()
    const ratio = OUTPUT_SIZE / SIZE
    const baseScale = Math.max(SIZE / img.width, SIZE / img.height)
    const scale = baseScale * zoom
    const w = img.width * scale * ratio, h = img.height * scale * ratio
    const x = (SIZE / 2 - (img.width * scale) / 2 + offset.x) * ratio
    const y = (SIZE / 2 - (img.height * scale) / 2 + offset.y) * ratio
    ctx.drawImage(img, x, y, w, h)
    ctx.restore()
    out.toBlob(blob => {
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" })
      onSave(file, out.toDataURL("image/jpeg", 0.9))
    }, "image/jpeg", 0.9)
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 }}>
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:20, width:320, maxWidth:"92vw", boxSizing:"border-box" }}>
        <div style={{ fontWeight:800, fontSize:15, color:"#0F172A", marginBottom:14, textAlign:"center", fontFamily:"var(--font-head)" }}>Adjust Photo</div>
        <canvas
          ref={canvasRef} width={SIZE} height={SIZE}
          style={{ display:"block", margin:"0 auto 14px", cursor:"grab", touchAction:"none", background:"#F1F5F9", borderRadius:"50%" }}
          onMouseDown={e => startDrag(e.clientX, e.clientY)}
          onMouseMove={e => moveDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag} onMouseLeave={endDrag}
          onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY) }}
          onTouchEnd={endDrag}
        />
        <div style={{ fontSize:11, color:"#64748B", marginBottom:6, textAlign:"center" }}>Drag to reposition · Slide to zoom</div>
        <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width:"100%", marginBottom:16 }}/>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"11px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#F8FAF8", fontSize:13, cursor:"pointer" }}>Cancel</button>
          <button onClick={save} style={{ flex:2, padding:"11px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)" }}>Save Photo</button>
        </div>
      </div>
    </div>
  )
}

// Convenience wrapper: a circular "tap to add/change photo" control that opens
// the crop modal automatically when a file is picked.
export function PhotoUploadField({ photoPreview, onPhotoSaved, size = 88, label = "Upload Photo *" }) {
  const [cropSrc, setCropSrc] = useState("")
  const onPhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ""
  }
  return (
    <>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:size, height:size, borderRadius:"50%", background:"#F8FAF8", border: photoPreview ? "2px solid #166534" : "2px dashed #E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", margin:"0 auto 8px" }}>
          {photoPreview ? <img src={photoPreview} alt="Profile" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ fontSize:11, color:"#94A3B8" }}>Add Photo</span>}
        </div>
        <label style={{ cursor:"pointer" }}>
          <span style={{ fontSize:12, color:"#166534", fontWeight:700 }}>{photoPreview ? "Change Photo" : label}</span>
          <input type="file" accept="image/*" onChange={onPhotoChange} style={{ display:"none" }}/>
        </label>
      </div>
      {cropSrc && <PhotoCropModal imageSrc={cropSrc} onCancel={() => setCropSrc("")} onSave={(file, dataUrl) => { onPhotoSaved(file, dataUrl); setCropSrc("") }}/>}
    </>
  )
}
