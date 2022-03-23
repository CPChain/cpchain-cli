export declare class PackageJson {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    scripts: {};
    devDependencies: {};
    dependencies: {};
    constructor();
    writeTo(dir: string): void;
}
