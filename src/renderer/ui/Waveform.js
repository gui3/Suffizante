const colors = require("./colors.js")

class Waveform {
  constructor (options) {
    options = {
      width: "500px",
      height: "200px",
      defaultWidth: 300,
      defaultHeight: 100,
      addControls: true,
      ...options
    }
    this.defaultWidth = options.defaultWidth
    this.defaultHeight = options.defaultHeight

    this.current = {}
    this.zoomMode = false

    this.canvas = document.createElement("canvas")
    this.canvas.style.width = "100%" //options.width
    this.canvas.style.height = "100%" //options.height
    this.canvas.style.border = "1px solid " + colors.fade
    this.ctx = this.canvas.getContext("2d")

    this.container = document.createElement("div")
    this.container.appendChild(this.canvas)

    this.element = document.createElement("div")
    this.container.style.width = options.width
    this.container.style.height = options.height

    this.doZoomBound = this.doZoom.bind(this)

    if (options.addControls) {
      this.toolbar = document.createElement("nav")

      this.refreshButton = document.createElement("button")
      this.refreshButton.appendChild(
        document.createTextNode("🔄")
      )
      this.refreshButton.addEventListener("click", evt => {
        this.refresh()
      })
      this.toolbar.appendChild(this.refreshButton)

      this.zoomModeButton = document.createElement("button")
      this.zoomModeButton.appendChild(
        document.createTextNode("🔎")
      )
      this.zoomModeButton.addEventListener("click", this.toggleZoomMode.bind(this))
      this.toolbar.appendChild(this.zoomModeButton)
      
      this.sampleCoord = document.createElement("span")
      this.canvas.addEventListener("mousemove", this.showTimeCoord.bind(this))
      this.toolbar.appendChild(this.sampleCoord)

      this.element.appendChild(this.toolbar)
    }
    this.element.appendChild(this.container)
  }

  setAudioBuffer (audioBuffer, options = {}) {
    this.audioBuffer = audioBuffer
    this.setOptions(options)
    this.calculateAndDraw()
  }

  setOptions(options = {}) {
    options = {
      width: "500px",
      height: "200px",
      defaultWidth: 300,
      defaultHeight: 100,
      pos: 0.5,
      zoom: 1,
      // normalize: true,
      drawStart: 0,
      drawEnd: -1,
      highlightStart: 0,
      highlightEnd: -1,
      addControls: true,
      ...options
    }
    this.pos = options.pos
    this.zoom = options.zoom
    // this.normalize = options.normalize
    this.defaultWidth = options.defaultWidth
    this.defaultHeight = options.defaultHeight
    this.drawStart = options.drawStart
    this.drawEnd = options.drawEnd
    this.highlightStart = options.highlightStart
    this.highlightEnd = options.highlightEnd
  }

  refresh() {
    this.zoomOnSampleRegion(
      this.drawStart,
      this.drawEnd === -1 ? this.audioBuffer.length : this.drawEnd
    )
  }

  showTimeCoord (evt) {
    const mouseX = evt.clientX
    const rect = this.canvas.getBoundingClientRect()
    const leftX = rect.left
    const widthX = rect.width
    const mousePercent = (mouseX - leftX) / widthX
    const sample = Math.floor(this.current.sampleStart
      + mousePercent * this.current.sampleZoomLength)
    const time = Math.round(100 * sample / this.audioBuffer.sampleRate) / 100
    while (this.sampleCoord.firstChild) {
      this.sampleCoord.removeChild(this.sampleCoord.firstChild)
    }
    this.sampleCoord.appendChild(document.createTextNode(
      time + "s"
    ))
  }

  zoomOnSampleRegion(start, end) {
    const sampleLength = end - start
    this.zoom = sampleLength / this.audioBuffer.length
    this.pos = (start + sampleLength /2) / this.audioBuffer.length
    this.calculateAndDraw()
  }

  calculateAndDraw() {
    this.calculate()
    this.redraw()
  }

  calculateCanvasDimensions() {
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = Math.floor(rect.width || this.defaultWidth)
    this.canvas.height = Math.floor(rect.height || this.defaultWidth)
    const width = this.canvas.width
    const height = this.canvas.height
    return {
      width,
      height
    }
  }

  redraw() {
    const {width, height} = this.calculateCanvasDimensions()
    const chunkSize = this.current.chunkSize
    const sampleStart = this.current.sampleStart
    const bufferLength = this.audioBuffer.length

    const sampleZoomLength = this.current.sampleZoomLength

    // const start = Math.max(0, bufferLength * this.pos - zoomLength / 2)
    // const end = Math.min(bufferLength, start + zoomLength)
    // // this.pos = (start + zoomLength /2) / bufferLength
    // const startGraph = Math.floor(start * this.current.graph.length / bufferLength)
    // const endGraph = Math.round(end * this.current.graph.length / bufferLength)
    // const zoomGraph = Math.round(zoomLength * this.current.graph.length / bufferLength)

    const hStart = this.highlightStart >= 0 && this.highlightStart || 0
    const hEnd = this.highlightEnd === -1 
    ? bufferLength 
    : this.highlightEnd < bufferLength && this.highlightEnd || bufferLength

    this.ctx.clearRect(0, 0, width, height)
    if (!this.current && !this.current.valid
      || this.current.graph.length < 1) {
      this.ctx.fillStyle  = colors.front
      this.ctx.fillRect(
        0,
        height/2,
        width,
        1
      )
      return
    }

    const chunkWidth = width / this.current.graph.length

    this.ctx.fillStyle  = colors.fade
    let highlight = false
    for (let x = 0; x < this.current.graph.length; x++) {
    //for (let x = 0, i = startGraph; i < endGraph; x++, i++) {
      let sampleX = x * chunkSize + sampleStart
      if (sampleX > hStart) {
        if (highlight === false && sampleX < hEnd) {
          this.ctx.fillStyle  = colors.color1
          highlight = true
        } else if (highlight === true && sampleX >= hEnd) {
          this.ctx.fillStyle = colors.fade
        }
      }

      const positive = this.current.graph[x][0]
      const negative = this.current.graph[x][1]

      const chunkAmp = -(negative - positive)
      this.ctx.fillRect(
        x,
        height / 2 - positive * height,
        1,
        Math.max(1, chunkAmp * height)
      )
    }
  }

  calculate () {
    const { width } = this.calculateCanvasDimensions()
    if (!this.audioBuffer || !this.audioBuffer.getChannelData) {
      this.current.valid = false
      return
    }

    const bufferLength = this.audioBuffer.length

    let sampleZoomLength = bufferLength / this.zoom

    // const start = this.drawStart >= 0 && this.drawStart || 0
    // const end = this.drawEnd === -1 
    // ? bufferLength 
    // : this.drawEnd < bufferLength && this.drawEnd || bufferLength

    const samplePos = this.pos * bufferLength
    const sampleStart = Math.max(0, Math.round(
      samplePos - sampleZoomLength / 2
    ))
    const sampleEnd = Math.min(
      bufferLength,
      this.drawEnd > this.drawStart ? this.drawEnd : bufferLength,
      Math.round(sampleStart + sampleZoomLength)
    )
    this.pos = (sampleStart + (sampleEnd - sampleStart) /2) / bufferLength
    sampleZoomLength = sampleEnd - sampleStart

    this.current.sampleStart = sampleStart
    this.current.sampleEnd = sampleEnd
    this.current.bufferLength = bufferLength
    this.current.sampleZoomLength = sampleZoomLength

    const rawAudioData = this.audioBuffer.getChannelData(0)
    .slice(sampleStart, sampleEnd)
  
    const chunkSize = Math.max(1, Math.floor(rawAudioData.length / width))
    this.current.chunkSize = chunkSize
    this.current.graph = []
    for (let x = 0; x < width; x++) {
      const start = x*chunkSize
      const end = start + chunkSize
      const chunk = rawAudioData.slice(start, end)
      let positive = 0
      let negative = 0
      // chunk.forEach(val => 
      //   val > 0 && (positive += val) || val < 0 && (negative += val)
      // )
      let sampleJump = 1
      if (chunkSize > 500) {
        sampleJump = Math.floor(chunkSize / 500)
      }
      for (let s = 0; s < chunk.length; s += sampleJump) {
        chunk[s] > 0 && (positive += chunk[s]) || chunk[s] < 0 && (negative += chunk[s])
      }

      negative /= chunk.length / sampleJump
      positive /= chunk.length / sampleJump

      this.current.graph.push([positive, negative])
    }
  }



  toggleZoomMode () {
    if (this.zoomMode) {
      this.disableZoom()
    } else {
      this.enableZoom()
    }
  }
  enableZoom () {
    this.canvas.addEventListener("mousedown", this.doZoomBound)
    this.zoomMode = true
    this.zoomModeButton.style.background = colors.color1
  }
  disableZoom () {
    this.canvas.removeEventListener("mousedown", this.doZoomBound)
    this.zoomMode = false
    this.zoomModeButton.style.background = "inherit"
  }

  doZoom (evt) {
    evt.preventDefault()
    const mousePos = {
      currentX: evt.clientX,
      initX: evt.clientX,
      initY: evt.clientY,
      deltaX: 0,
      deltaY: 0
    }
    const rect = this.canvas.getBoundingClientRect()
    const leftX = rect.left
    const centerX = rect.left + rect.width / 2
    // mousePos.targetPosX = (mousePos.initX - centerX) / this.canvas.clientWidth

    function zoom () {
      if (true 
        /*Math.abs(mousePos.DeltaX) > 30 || Math.abs(mousePos.deltaY) > 30*/
      ) {
        // mousePos.targetClientX = 
        //   (mousePos.currentX - leftX) / rect.width
        mousePos.deltaClientX = 
          (mousePos.currentX - centerX) / rect.width

        const startPosX = this.current.sampleStart / this.current.bufferLength
        const endPosX = this.current.sampleEnd / this.current.bufferLength

        const offsetPosX = (endPosX - startPosX) * (mousePos.deltaClientX)
        //const targetPosX = startPosX + (endPosX - startPosX) * (mousePos.targetClientX)

        const newZoom= Math.min(1000, Math.max(0.5, 
          this.zoom - mousePos.deltaY * this.zoom / 100
        ))

        //console.log(targetPosX, offsetPosX)

        this.pos  = Math.min(1, Math.max(0, 
          this.pos - offsetPosX + (offsetPosX * 1.1) * newZoom / this.zoom
          //this.pos + (mousePos.deltaX  / 500 + mousePos.targetPosX) / this.zoom
          // this.pos
          // + (mousePos.deltaPosX * newZoom - mousePos.deltaPosX * this.zoom) 
          // * (endWavePercent - startWavePercent)
          // * this.zoom / newZoom
        ))
        this.zoom = newZoom
        this.calculateAndDraw()
      }
    }
    const zoomBound = zoom.bind(this)
    const interval = setInterval(zoomBound, 100)
    function move (evt2) {
      mousePos.currentX = evt2.clientX
      // mousePos.deltaX = evt2.clientX - mousePos.initX
      
      const rect = this.canvas.getBoundingClientRect()
      const centerY = rect.top + (rect.bottom - rect.top) / 2
      mousePos.deltaY = evt2.clientY - centerY
    }
    const moveBound = move.bind(this)
    document.addEventListener("mousemove", moveBound)
    function stopDrag () {
      clearInterval(interval)
      document.removeEventListener("mousemove", moveBound)
      document.removeEventListener("mouseup", stopDrag)
      document.removeEventListener("mouseleave", stopDrag)
    }
    document.addEventListener("mouseup", stopDrag)
    document.addEventListener("mouseleave", stopDrag)
    moveBound(evt)
    zoomBound()
  }
}

module.exports = Waveform