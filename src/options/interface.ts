import { Command } from 'commander'
import utils from '../utils'
import { loadConfig } from '../configs'

export type OptionType = string | number

export type OptionSection = 'chain' | 'wallet' | 'contract'

export interface Option {
  name: string
  description: string
  defaultValue?: OptionType
  section?: OptionSection // section name in config file
}

export type OptionsIsSet = {
  [key: string]: boolean
}

export type OptionHandler = (value: string, previous: any) => any

export function setOptionIsSet (optName: string, optionsIsSet: OptionsIsSet): OptionHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (value: string, previous: any) => {
    optionsIsSet[optName] = true
    return value
  }
}

export type CommandAction = (options: any) => void | Promise<void>

interface ICommander {
  // If enable config file, the default value of the option will be set to the value of the config file.
  useConfig(): ICommander
  addOption(option: Option, required?: boolean): ICommander
  action(fn: CommandAction): ICommander
}

export class MyCommander implements ICommander {
  command: Command
  optionsIsSet: OptionsIsSet
  enableConfig: boolean
  options: Option[]
  constructor (command: Command) {
    this.command = command
    this.optionsIsSet = {} as OptionsIsSet
    this.enableConfig = false
    this.options = []
  }

  useConfig (): ICommander {
    this.enableConfig = true
    return this
  }

  addOption (option: Option, required: boolean = false): ICommander {
    const { name, description, defaultValue } = option
    const optionStr = `--${name} <${name}>`
    const handler = setOptionIsSet(name, this.optionsIsSet)
    if (required) {
      this.command.requiredOption(optionStr, description, handler, defaultValue)
    } else {
      this.command.option(optionStr, description, handler, defaultValue)
    }
    this.options.push(option)
    return this
  }

  action (fn: CommandAction): ICommander {
    this.command.action(async options => {
      if (this.enableConfig) {
        const configPath = options.config || 'cpchain-cli.toml'
        if (await utils.loader.fileExists(configPath)) {
          const config = loadConfig(configPath)
          // iterate all options
          for (const option of this.options) {
            const { name, section } = option
            if (!this.optionsIsSet[name]) {
              // if the option is not set by user, set the value from config file or default value
              if (section) {
                const sectionConfig = config[section]
                if (sectionConfig && sectionConfig[name]) {
                  options[name] = sectionConfig[name]
                }
              } else {
                if (config[name]) {
                  options[name] = config[name]
                }
              }
            }
          }
        }
      }
      // convert the type of options
      for (const option of this.options) {
        const { name, defaultValue } = option
        // string to number
        if (typeof defaultValue === 'number') {
          options[name] = Number(options[name])
        }
      }
      fn(options)
    })
    return this
  }
}
