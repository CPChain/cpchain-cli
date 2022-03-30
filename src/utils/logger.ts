import kleur from 'kleur'

export default {
  fatal (msg: string) {
    this.error(msg)
    process.exit(1)
  },
  error (msg: string) {
    console.error(kleur.red(msg))
  },
  warn (msg: string) {
    console.log(kleur.yellow(msg))
  },
  info (msg: string) {
    console.log(kleur.cyan(msg))
  },
}
