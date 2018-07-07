const fs = require('fs')
const path = require('path')
const R = require('ramda')
const PDF = require('pdfkit')
const pdfToImgs = require('./pdfToImgs').convert

const mapIndexed = R.addIndex(R.map)
const forEachIndexed = R.addIndex(R.forEach)

const NINEUP_PLACEMENT = { x: 30, y: 15, width: 550, fileName: __dirname + '/../assets/9-up.png' }
const IMGS_PER_PAGE = 9
const IMG_FORMATS = /\.jpg|\.jpeg/
const IMG_PLACEMENTS = [
  { x: 48, y: 32, width: 172, height: 240 },
  { x: 221, y: 32, width: 173, height: 240 },
  { x: 395, y: 32, width: 168, height: 240 },

  { x: 48, y: 273, width: 172, height: 240 },
  { x: 221, y: 273, width: 173, height: 240 },
  { x: 395, y: 273, width: 168, height: 240 },

  { x: 48, y: 514, width: 172, height: 240 },
  { x: 221, y: 514, width: 173, height: 240 },
  { x: 395, y: 514, width: 168, height: 240 },
]

const Nineup = () => {
  const showImg = ({ x, y, width, height, fileName }) => {
    return `Img { x: ${x}, y: ${y}, width: ${width}, height: ${height}, fileName: ${fileName} }`
  }

  const imgsInDir = (dir) => {
    const contents = fs.readdirSync(dir)
    const imgs = R.filter(
      R.pipe(R.match(IMG_FORMATS), R.complement(R.isEmpty)),
      contents
    )
    const fullPath = (fileName) => `${dir}/${fileName}`
    return R.map(fullPath, imgs)
  }

  const assignPlacements = (pageOfImgs) => {
    const assignPlacement = (fileName, i) => {
      return R.merge(IMG_PLACEMENTS[i], { fileName })
    }
    return mapIndexed(assignPlacement, pageOfImgs)
  }

  const imgsToPages = (imgPaths) => {
    const pages = R.splitEvery(IMGS_PER_PAGE, imgPaths)
    return R.map(assignPlacements, pages)
  }

  const create = ({ pdf, dir, out }) => {
    if (!R.isNil(pdf)) { return createFromPDF(pdf, out) }
    if (!R.isNil(dir))  { return createFromDir(dir, out) }

    throw `You must specify either --dir <DIR> or --pdf <FILE>`
  }

  const createFromPDF = async (pdf, outFile) => {
    const dir = path.dirname(path.resolve(pdf))
    await pdfToImgs({ fileName: pdf, outDir: dir })
    createFromDir(dir, outFile)
  }

  const createFromDir = (dir, outFile) => {
    const pages = imgsToPages(imgsInDir(dir))

    const doc = new PDF

    forEachIndexed((page, p) => {
      if (p !== 0) { doc.addPage() }
      doc.image(
        NINEUP_PLACEMENT.fileName,
        NINEUP_PLACEMENT.x,
        NINEUP_PLACEMENT.y,
        { width: NINEUP_PLACEMENT.width }
      )

      const imgs = pages[p]

      R.forEach(async ({ fileName, x, y, width, height }) => {
        doc.image(fileName, x, y, { width, height })
      }, imgs)
    }, pages)

    console.log(`Outputting to ${outFile}`)
    doc.pipe(fs.createWriteStream(outFile))
    doc.end()
    console.log('Done')
  }

  return {
    create,
    imgsInDir,
    imgsToPages,
  }
}

const nineup = Nineup()
module.exports = nineup
