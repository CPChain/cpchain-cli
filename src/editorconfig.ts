import { GenerateConfig } from './generate'
import fs from 'fs'

export function generateEditorConfig (config: GenerateConfig) {
  const path = `${config.dir}/.editorconfig`
  const gitignore = `# http://editorconfig.org
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
insert_final_newline = false
trim_trailing_whitespace = false

[*.sol]
indent_size = 4

`
  fs.writeFileSync(path, gitignore)
}
