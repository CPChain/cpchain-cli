import fs from 'fs'

export default {
  fileExists (filePath: string): Promise<boolean> {
    return Promise.resolve(fs.existsSync(filePath))
  },
  readFile (filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}
