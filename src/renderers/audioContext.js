
const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

// const canvas = document.getElementById("waveform")
// const canvasCtx = canvas.getContext("2d")

async function decodeAudio (audioData) {
  const source = audioCtx.createBufferSource()

  source.buffer = await audioCtx.decodeAudioData(audioData)

  console.log(source)

  const wf = new Waveform()
  document.getElementById("testDiv").appendChild(wf.element)
  wf.setAudioBuffer(source.buffer)

  // drawWaveform(source.buffer, canvas, 0.1, 300)
}




function drawWaveform (audioBuffer, canvas, pos = 0.5, zoom = 1) {
  const canvasCtx = canvas.getContext("2d")
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  canvasCtx.clearRect(0, 0, width, height)
  canvasCtx.fillStyle  = "rgb(255, 0, 0)"

  const bufferLength = audioBuffer.length
  const zoomLength = bufferLength / zoom
  const start = Math.max(0, bufferLength * pos - zoomLength / 2)
  const end = Math.min(bufferLength, start + zoomLength)
  const rawAudioData = audioBuffer.getChannelData(0).slice(start, end)

  const chunkSize = Math.floor(rawAudioData.length / width)
  const values = []
  for (let x = 0; x < width; x++) {
    const start = x*chunkSize
    const end = start + chunkSize
    const chunk = rawAudioData.slice(start, end)
    test = chunk
    let positive = 0
    let negative = 0
    chunk.forEach(val => 
      val > 0 && (positive += val) || val < 0 && (negative += val)
    )
    negative /= chunk.length
    positive /= chunk.length
    chunkAmp = -(negative - positive)
    canvasCtx.fillRect(
      x,
      height / 2 - positive * height,
      1,
      Math.max(1, chunkAmp * height)
    )
  }
}