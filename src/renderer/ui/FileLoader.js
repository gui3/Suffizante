const colors = require("./colors")
const AudioFile = require("./AudioFile.js")

class FileLoader {
  constructor (options = {}) {
    options = {
      width: "100%",
      height: "100px",
      ...options
    }

    this.files = []

    this.tree = document.createElement("div")
    this.tree.style.overflow = "auto"

    this.toolbar = document.createElement("nav")
    
    this.loadButton = document.createElement("button")
    this.loadButton.appendChild(document.createTextNode(
      "📁"
    ))
    this.loadButton.addEventListener("click", this.openFileDialog.bind(this))
    this.toolbar.appendChild(this.loadButton)

    this.element = document.createElement("div")
    this.element.style.width = options.width
    this.element.style.height = options.height
    this.element.appendChild(this.toolbar)
    this.element.appendChild(this.tree)
  }

  draw () {
    while(this.tree.firstChild) {
      this.tree.removeChild(this.tree.firstChild)
    }
    this.files.forEach(file => {
      this.tree.appendChild(file.element)
    })
  }

  loadFile (filepath) {
    const file = new AudioFile(filepath)
    this.files.push(file)
    this.draw()
  }

  openFileDialog () {
    const filepath = prompt("indicate file path to load")
    this.loadFile(filepath)
  }
}

module.exports = FileLoader