import { PackageJson } from './types'
export declare class PackageJsonBuiler {
    private package;
    constructor();
    reset(): void;
    setName(name: string): PackageJsonBuiler;
    setVersion(version: string): PackageJsonBuiler;
    setAuthor(author: string): PackageJsonBuiler;
    setDescription(description: string): PackageJsonBuiler;
    setLicense(license: string): PackageJsonBuiler;
    addDevDependencies(name: string, version: string): PackageJsonBuiler;
    addDependencies(name: string, version: string): PackageJsonBuiler;
    addScript(name: string, cmd: string): PackageJsonBuiler;
    build(): PackageJson;
}
