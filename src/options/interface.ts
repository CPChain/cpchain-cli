import { Command } from 'commander'
import utils from '../utils'
import { loadConfig } from '../configs'

export type OptionType = string | number | string[]

export type OptionSection = 'chain' | 'wallet' | 'contract'

export interface Option {
  name: string
  description: string
  defaultValue?: OptionType
  section?: OptionSection // section name in config file
}

export const ConfigOption = {
  name: 'config',
  description: 'Path of the config file',
  defaultValue: 'cpchain-cli.toml'
} as Option

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
  required: {[key: string]: boolean}
  constructor (command: Command) {
    this.command = command
    this.optionsIsSet = {} as OptionsIsSet
    this.enableConfig = false
    this.options = []
    this.required = {}
  }

  useConfig (): ICommander {
    this.enableConfig = true
    this.addOption(ConfigOption)
    return this
  }

  addOption (option: Option, required: boolean = false): ICommander {
    const { name, description, defaultValue } = option
    let optionStr = `--${name}`
    if (defaultValue && Array.isArray(defaultValue)) {
      optionStr += ` [${name}]`
    } else {
      optionStr += ` <${name}>`
    }

    const handler = setOptionIsSet(name, this.optionsIsSet)
    this.command.option(optionStr, description, handler, defaultValue)
    if (required) {
      this.required[name] = true
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
        // check if required option is set
        if (this.required[name] && !options[name]) {
          utils.logger.error(`Error: ${name} is required`)
          return
        }
      }
      fn(options)
    })
    return this
  }
}
