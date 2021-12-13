import {GenerateConfig, generate} from './generate'


function help() {
    console.log(`Usage: cpchain-cli [generate|help] [options]

Options:
  -n, --name                        contract name

--
  help, -h, --help                  print command line options

    `)
}

function whichCmd(argv) {
  return argv._.length > 0 && argv._[0]
}

function main() {
  let argv = require('minimist')(process.argv.slice(2));
  const cmd = whichCmd(argv)
  if (cmd === 'help') {
    return help()
  }
  else if (cmd === 'generate') {
    const config = new GenerateConfig()
    config.name = argv.name || "example"
    return generate(config)
  }
  help()
}

main()
