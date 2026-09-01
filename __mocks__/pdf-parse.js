class PDFParse {
  constructor(options) {
    this._buffer = options.data;
  }
  async getText() {
    return { text: `mocked pdf content from ${this._buffer.length} bytes` };
  }
}

module.exports = { PDFParse };
