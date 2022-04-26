import { ChainOptions, WalletOptions } from '../options'
import fs from 'fs'
import toml from 'toml'

export interface CliConfig {
  chain: ChainOptions
  wallet: WalletOptions
}

export function loadConfig (configPath: string = 'cpchain-cli.toml'): CliConfig {
  const config = fs.readFileSync(configPath, 'utf8')
  const parsed = toml.parse(config)
  return <CliConfig>parsed
}
