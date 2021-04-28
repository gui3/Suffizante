
const { ipcRenderer } = require('electron')

// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // affiche "pong"

// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log(arg) // affiche "pong"
// })
// ipcRenderer.send('asynchronous-message', 'ping')

ipcRenderer.on("audio", (event, audio) => {
  decodeAudio(audio)
  .catch(err => console.error(err))
})

ipcRenderer.send("rendererReady")