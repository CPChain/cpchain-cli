import { GenerateConfig, generate } from './generate'
import boxen from 'boxen'
import * as minimist from 'minimist'

function help () {
  console.log(`Usage: cpchain-cli [generate|help] [options]

Options:
  -n, --name                        contract name

--
  help, -h, --help                  print command line options

    `)
}

function whichCmd (argv: { _: [string] }) {
  return argv._.length > 0 && argv._[0]
}

function getCaller (caller: any) {
  if (typeof caller !== 'function') {
    return caller.default
  }
  return caller
}

function showBox (message: string) {
  const box = boxen(message, {
    align: 'center',
    borderStyle: 'double',
    borderColor: 'green',
    dimBorder: true,
    padding: 1
  })
  console.log(box + '\n')
}

function main () {
  const argvCall = getCaller(minimist)
  const argv = argvCall(process.argv.slice(2))
  const cmd = whichCmd(argv)

  // show box
  showBox('CPChain CLI: A scaffold for developing smart contracts on CPChain')

  if (cmd === 'help') {
    return help()
  } else if (cmd === 'generate') {
    const config = new GenerateConfig()
    config.name = argv.name || argv.n || 'example'
    return generate(config)
  }
  help()
}

main()
