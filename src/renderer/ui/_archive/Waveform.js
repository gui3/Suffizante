class Waveform {
  constructor (options) {
    options = {
      width: 500,
      height: 200,
      pos: 0.5,
      zoom: 1,
      normalize: true,
      ...options
    }
    this.pos = options.pos
    this.zoom = options.zoom
    this.normalize = options.normalize

    this.canvas = document.createElement("canvas")
    this.canvas.style.width = options.width
    this.canvas.style.height = options.height
    this.canvas.style.border = "2px solid black"
    this.ctx = this.canvas.getContext("2d")
    
    this.element = document.createElement("div")
    // this.element.style.width = options.width
    // this.element.style.height = options.height
    this.element.appendChild(this.canvas)

    this.canvas.addEventListener("mousedown", evt => {
      const mousePos = {
        currentX: evt.clientX,
        initX: evt.clientX,
        initY: evt.clientY,
        deltaX: 0,
        deltaY: 0
      }
      const rect = this.canvas.getBoundingClientRect()
      const leftX = rect.left
      const centerX = rect.left + this.canvas.clientWidth / 2
      // mousePos.targetPosX = (mousePos.initX - centerX) / this.canvas.clientWidth

      const interval = setInterval(_ => {
        if (true 
          /*Math.abs(mousePos.DeltaX) > 30 || Math.abs(mousePos.deltaY) > 30*/
        ) {
          mousePos.targetPosX = 
            mousePos.currentX - leftX / this.canvas.clientWidth
          mousePos.deltaPosX = 
            mousePos.currentX - centerX / this.canvas.clientWidth
          this.zoom = Math.min(1000, Math.max(0.5, 
            this.zoom - mousePos.deltaY * this.zoom / 100
          ))
          this.pos  = Math.min(1, Math.max(0, 
            //this.pos + (mousePos.deltaX  / 500 + mousePos.targetPosX) / this.zoom
            this.pos 
            // + (mousePos.deltaX / this.canvas.clientWidth) 
            //+ mousePos.targetPosX / this.zoom
            + mousePos.deltaPosX / this.zoom
          ))
          this.draw()
          document.getElementById("display")
          .innerHTML = "p:" + this.pos 
          + "/z:" + this.zoom 
          + "/t:" + mousePos.targetPosX
        }
        
      }, 100)
      function move (evt2) {
        mousePos.currentX = evt2.clientX
        // mousePos.deltaX = evt2.clientX - mousePos.initX
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
    const width = this.canvas.width
    const height = this.canvas.height
    console.log(width, height)
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
    // this.pos = (start + zoomLength /2) / bufferLength



    const rawAudioData = this.audioBuffer.getChannelData(0).slice(start, end)
  
    const chunkSize = Math.max(1, Math.floor(rawAudioData.length / width))
    const values = []
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

      values.push([positive, negative])

      const chunkAmp = -(negative - positive)
      this.ctx.fillRect(
        x,
        height / 2 - positive * height,
        1,
        Math.max(1, chunkAmp * height)
      )
    }
    // const normalizeRatio = this.normalize
    // ? 1 / (Math.max(maxPositive, maxNegative) || 1)
    // : 1
    // values.forEach((v, ix) => {
    //   const positive = v[0] * normalizeRatio
    //   const negative = v[1] * normalizeRatio
    //   const chunkAmp = -(negative - positive)
    //   this.ctx.fillRect(
    //     ix,
    //     height / 2 - positive * height,
    //     1,
    //     Math.max(1, chunkAmp * height)
    //   )
    // })
  }
}

module.exports = Waveform