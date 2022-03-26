import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

export default {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        resolve: {
          fullySpecified: false
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['main', 'module']
  },
  output: {
    filename: 'bundle.cjs',
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    'utf-8-validate': 'utf-8-validate',
    encoding: 'encoding',
    bufferutil: 'bufferutil'
  }
}
