import { PackageJson } from './types'

export class PackageJsonBuiler {
  private package: PackageJson;

  constructor () {
    this.reset()
  }

  public reset () {
    this.package = new PackageJson()
  }

  public setName (name: string) {
    this.package.name = name
  }

  public setVersion (version: string) {
    this.package.version = version
  }

  public setAuthor (author: string) {
    this.package.author = author
  }

  public setDescription (description: string) {
    this.package.description = description
  }

  public setLicense (license: string) {
    this.package.license = license
  }

  public addDevDependencies (name: string, version: string) {
    this.package.devDependencies[name] = version
  }

  public addDependencies (name: string, version: string) {
    this.package.dependencies[name] = version
  }

  public addScript (name: string, cmd: string) {
    this.package.scripts[name] = cmd
  }

  public build () : PackageJson {
    // Return current object and create a new in builder
    const result = this.package
    this.reset()
    return result
  }
}
