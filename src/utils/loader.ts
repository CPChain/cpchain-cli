import fs from 'fs'

export default {
  fileExists (filePath: string): Promise<boolean> {
    return Promise.resolve(fs.existsSync(filePath))
  },
  isDirectory (filePath: string): Promise<boolean> {
    return this.fileExists(filePath).then(exists => {
      return exists ? fs.statSync(filePath).isDirectory() : false
    })
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
