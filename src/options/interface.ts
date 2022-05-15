
export type OptionType = string | number

export interface Option {
  name: string
  description: string
  defaultValue?: OptionType
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
