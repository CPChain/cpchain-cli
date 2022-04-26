import { Command } from 'commander'

export interface ConfigOptions {
  config: string
}

export function addConfigOptions (command: Command, required: boolean = false) {
  const options = {
    configPath: ['--config <path>', 'Path of the config file', '']
  }
  for (const key in options) {
    const [option, description, defaultValue] = options[key]
    if (required) {
      command.requiredOption(option, description, defaultValue)
    } else {
      command.option(option, description, defaultValue)
    }
  }
  return command
}
