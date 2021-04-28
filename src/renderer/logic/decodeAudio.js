const audioCtx = require("./audioCtx.js")

module.exports = async function decodeAudio (audioData) {
  const audioSource = audioCtx.createBufferSource()

  audioSource.buffer = await audioCtx.decodeAudioData(audioData)

  return audioSource
}