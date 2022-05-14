import { PackageJson } from '../types'

export class PackageJsonBuiler {
  private package: PackageJson;

  constructor () {
    this.reset()
  }

  public reset () {
    this.package = new PackageJson()
  }

  public setName (name: string) : PackageJsonBuiler {
    this.package.name = name
    return this
  }

  public setVersion (version: string) : PackageJsonBuiler {
    this.package.version = version
    return this
  }

  public setAuthor (author: string) : PackageJsonBuiler {
    this.package.author = author
    return this
  }

  public setDescription (description: string) : PackageJsonBuiler {
    this.package.description = description
    return this
  }

  public setLicense (license: string) : PackageJsonBuiler {
    this.package.license = license
    return this
  }

  public addDevDependencies (name: string, version: string) : PackageJsonBuiler {
    this.package.devDependencies[name] = version
    return this
  }

  public addDependencies (name: string, version: string) : PackageJsonBuiler {
    this.package.dependencies[name] = version
    return this
  }

  public addScript (name: string, cmd: string) : PackageJsonBuiler {
    this.package.scripts[name] = cmd
    return this
  }

  public build () : PackageJson {
    // Return current object and create a new in builder
    const result = this.package
    this.reset()
    return result
  }
}
