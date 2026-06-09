import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { definePackageConfig } from '../../vite.package.config'

export default definePackageConfig(dirname(fileURLToPath(import.meta.url)))
