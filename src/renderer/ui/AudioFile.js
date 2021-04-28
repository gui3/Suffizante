const { ipcRenderer } = require('electron')

// const error = require("../error.js")
const log = require("../log.js")
const decodeAudio = require("../logic/decodeAudio.js")
const Waveform = require("./Waveform.js")

class AudioFile {
  constructor (path, options = {}) {
    options = {
      ...options
    }
    this.path = path
    this.loaded = false

    this.titleSpan = document.createElement("span")
    this.titleSpan.appendChild(document.createTextNode(
      this.path
    ))
    this.element = document.createElement("div")
    this.element.appendChild(this.titleSpan)
  }

  async fetchLocalFile () {
    const rawFile = await ipcRenderer.invoke("requestLocalFile", this.path)
    this.audioSource = await decodeAudio(rawFile)
    log("audio file " + this.path + " loaded sucessfully")
    this.loaded = true
    return this.audioSource
  }

  getWaveform (options) {
    this.waveform = new Waveform(options)
    this.waveform.setAudioBuffer(this.audioSource.buffer, options)
    return this.waveform
  }

  showInWaveform (waveform, options) {
    waveform.setAudioBuffer(this.audioSource.buffer, options)
  }
}


module.exports = AudioFile