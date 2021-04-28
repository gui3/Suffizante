const { ipcMain } = require('electron')
const fs = require("fs")
const path = require("path")

module.exports = function setupMainEvents () {
  // ipcMain.on('asynchronous-message', (event, arg) => {
  //   console.log(arg) // affiche "ping"
  //   event.reply('asynchronous-reply', 'pong')
  // })

  // ipcMain.on('synchronous-message', (event, arg) => {
  //   console.log(arg) // affiche "ping"
  //   event.returnValue = 'pong'
  // })

  ipcMain.on("rendererReady", (event, arg) => {
    const audio = fs.readFileSync(
      path.join(__dirname, "../../demo/guitar.wav")
      //path.join(__dirname, "../../demo/T'Arrêterais Tu.mp3")
    )
    event.reply("audio", audio.buffer)
  })

  ipcMain.handle("requestLocalFile", async (evt, filepath) => {
    const audio = fs.readFileSync(
      path.join(filepath)
      //path.join(__dirname, "../../demo/guitar.mp3")
      //path.join(__dirname, "../../demo/T'Arrêterais Tu.mp3")
    )
    return audio.buffer
  })
}