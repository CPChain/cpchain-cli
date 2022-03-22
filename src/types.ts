export class PackageJson {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  devDependencies: {};
  dependencies: {};
}

export class PackageJsonBuiler {
  private package: PackageJson;

  constructor() {
    this.reset();
  }

  public reset() {
    this.package = new PackageJson();
  }
}
