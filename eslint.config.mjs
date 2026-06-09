// @ts-check
import jslint from '@eslint/js'
import tslint from 'typescript-eslint'

export default [
  jslint.configs.recommended,
  ...tslint.configs.recommended,
]
