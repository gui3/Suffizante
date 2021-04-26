const { app, BrowserWindow } = require('electron')
const path = require('path')

const ready = require("./main/ready.js")


app.whenReady().then(() => {
  ready()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})