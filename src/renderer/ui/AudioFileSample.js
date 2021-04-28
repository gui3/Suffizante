class AudioFileSample {
  constructor (file, options = {}) {
    options = {
      start: 0,
      end: -1,
      ...options
    }
    this.file = file
    this.start = options.start
    this.end = options.end
  }
}


module.exports = AudioFileSample