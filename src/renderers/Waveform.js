class Waveform {
  constructor (options) {
    options = {
      width: 500,
      height: 200,
      pos: 0.5,
      zoom: 1,
      ...options
    }
    this.pos = options.pos
    this.zoom = options.zoom

    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")
    this.canvas.style.width = options.width
    this.canvas.style.height = options.height
    
    this.element = document.createElement("div")
    this.element.appendChild(this.canvas)

    this.canvas.addEventListener("mousedown", evt => {
      const mousePos = {
        initX: evt.clientX,
        initY: evt.clientY,
        deltaX: 0,
        deltaY: 0
      }
      const interval = setInterval(_ => {
        if (true 
          /*Math.abs(mousePos.DeltaX) > 30 || Math.abs(mousePos.deltaY) > 30*/
        ) {
          this.pos  = Math.min(1, Math.max(0, 
            this.pos + mousePos.deltaX / 10000
          ))
          this.zoom = Math.min(400, Math.max(0.5, 
            this.zoom - mousePos.deltaY / 100
          ))
          this.draw()
          document.getElementById("display")
          .innerHTML = this.pos + "//" + this.zoom
        }
        
      }, 100)
      function move (evt2) {
        mousePos.deltaX = evt2.clientX - mousePos.initX
        mousePos.deltaY = evt2.clientY - mousePos.initY
      }
      document.addEventListener("mousemove", move)
      function stopDrag () {
        clearInterval(interval)
        document.removeEventListener("mousemove", move)
        document.removeEventListener("mouseup", stopDrag)
        document.removeEventListener("mouseleave", stopDrag)
      }
      document.addEventListener("mouseup", stopDrag)
      document.addEventListener("mouseleave", stopDrag)
    })
  }

  setAudioBuffer (audioBuffer) {
    this.audioBuffer = audioBuffer
    this.draw()
  }


  draw () {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight
    console.log(width)
    console.log(height)
    this.ctx.clearRect(0, 0, width, height)
    if (!this.audioBuffer || !this.audioBuffer.getChannelData) {
      this.ctx.fillStyle  = "rgb(0, 0, 0)"
      this.ctx.fillRect(
        0,
        height/2,
        width,
        1
      )
      return
    }
    this.ctx.fillStyle  = "rgb(255, 0, 0)"
  
    const bufferLength = this.audioBuffer.length
    const zoomLength = bufferLength / this.zoom
    const start = Math.max(0, bufferLength * this.pos - zoomLength / 2)
    const end = Math.min(bufferLength, start + zoomLength)
    const rawAudioData = this.audioBuffer.getChannelData(0).slice(start, end)
  
    const chunkSize = Math.floor(rawAudioData.length / width)
    for (let x = 0; x < width; x++) {
      const start = x*chunkSize
      const end = start + chunkSize
      const chunk = rawAudioData.slice(start, end)
      let positive = 0
      let negative = 0
      chunk.forEach(val => 
        val > 0 && (positive += val) || val < 0 && (negative += val)
      )
      negative /= chunk.length
      positive /= chunk.length
      const chunkAmp = -(negative - positive)
      this.ctx.fillRect(
        x,
        height / 2 - positive * height,
        1,
        Math.max(1, chunkAmp * height)
      )
    }
  }
}