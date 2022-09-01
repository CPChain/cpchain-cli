
import fs from 'fs'

process.chdir(process.cwd())

const packageJson = JSON.parse(fs.readFileSync('package.json'))
delete packageJson.dependencies
delete packageJson.devDependencies
delete packageJson.scripts
delete packageJson.type

fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, '  '))
