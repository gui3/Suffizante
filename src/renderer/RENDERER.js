const error = require("./renderer/error.js")
const colors = require("./renderer/ui/colors.js")
const Waveform = require("./renderer/ui/Waveform.js")
const FileLoader = require("./renderer/ui/FileLoader.js")
const AudioFile = require("./renderer/ui/AudioFile.js")

// ELEMENTS:
const waveform = new Waveform({
  width: "100%",
  height: "100px"
})
document.getElementById("visualize")
.appendChild(waveform.element)

const fileLoader = new FileLoader({
  width: "200px",
  height: "150px"
})
document.getElementById("import")
.appendChild(fileLoader.element)

// TESTS:

const testPaths = [
  "C:/Users/guill/.code/Suffizante/demo/guitar.wav",
  "C:/Users/guill/.code/Suffizante/demo/song.mp3",
  "C:/Users/guill/Documents/_Music Prod/Exports/_monthly/Backstabs on Rainbow Road.wav"
]

testPaths.forEach(filepath => {
  fileLoader.loadFile(filepath)
})


const testFile = new AudioFile(testPaths[0])

testFile.fetchLocalFile()
.then(audioSource => {
  testFile.showInWaveform(
    waveform,
    {
      highlightStart: 100000,
      highlightEnd: 200000
    }
  )
})
.catch(err => error(err))