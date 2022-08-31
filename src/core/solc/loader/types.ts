// This module to load all your need contracst from the entry contract according to the import syntax.
// This module will create a single directory to store all contracts you need, change their import content.
// Then you can use solc compiler to compile the contract.

export interface Loader {
  /**
   * Load all contracts which parse from your entrypoint contract in a directory
   * @param entryContractPath Entrypoint contract
   * @return path of a directory
   */
  load (entryContractPath: string): { dir: string, entry: string }
  clean (dir: string)
}
