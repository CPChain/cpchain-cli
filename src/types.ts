import * as fs from 'fs'

export class PackageJson {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  scripts: {};
  devDependencies: {};
  dependencies: {};

  constructor () {
    this.license = 'MIT'
    this.scripts = {}
    this.dependencies = {}
    this.devDependencies = {}
  }

  public writeTo (dir: string) {
    const path = `${dir}/package.json`
    const packageJson = JSON.stringify(this, null, 2)
    fs.writeFileSync(path, packageJson)
  }
}
