const PDFImage = require('pdftoimage')

const PDFToImgs = () => {
  const convert = async ({ fileName, outDir }) => {
    // XXX: pngs are busted in PDFkit right now :(
    // https://github.com/devongovett/pdfkit/issues/766
    console.log('Converting ', fileName)
    const result = await PDFImage(fileName, {
      format: 'jpeg',
      outdir: outDir
    })
    console.log('Done converting')
    return result
  }

  return {
    convert,
  }
}

const converter = PDFToImgs()
module.exports = converter
