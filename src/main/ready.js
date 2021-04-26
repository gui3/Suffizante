const { app, BrowserWindow } = require('electron')
const path = require('path')

const setupMainProcess = require("./setupMainProcess")
const setupMainEvents = require("./setupMainEvents")


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../workers", 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  })

  win.loadFile(path.join(__dirname, "../index.html"))

  win.webContents.openDevTools()
}

function ready () {
  setupMainProcess()
  setupMainEvents()
  createWindow()
}

module.exports = ready