const { Command, flags } = require('@oclif/command')
const NineUp = require('./nineup')

class NineupCommand extends Command {
  async run() {
    const { flags } = this.parse(NineupCommand)
    const { dir, pdf, out } = flags
    NineUp.create({ dir, pdf, out })
  }
}

NineupCommand.description = `Turns a pdf of cards into "9-up" pages, i.e. pre-filled templates with 9 cards to a page
`

NineupCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: 'v' }),

  pdf: flags.string({
    description: `PDF containing card images. Individual card .jpg files will be generated in the dir containing the PDF. Pass either this or --dir`,
    exclusive: 'dir',
  }),

  dir: flags.string({
    description: `Dir containing card image files. Pass either this or --pdf`,
    exclusive: 'pdf',
  }),

  out: flags.string({
    char: 'o',
    description: 'Output 9-up PDF file',
    default: 'out.pdf',
    required: true,
  }),

  // add --help flag to show CLI version
  help: flags.help({
    char: 'h',
  }),
}

module.exports = NineupCommand
