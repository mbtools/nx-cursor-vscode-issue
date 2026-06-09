import { readFileSync } from 'node:fs'
import { builtinModules } from 'node:module'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

type PackageJson = {
  dependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const nodeBuiltins = new Set([
  ...builtinModules,
  ...builtinModules.map(moduleName => `node:${moduleName}`),
])

function readPackageJson(packageRoot: string): PackageJson {
  return JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8')) as PackageJson
}

export function definePackageConfig(packageRoot: string) {
  const packageJson = readPackageJson(packageRoot)
  const externalPackages = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ])

  return defineConfig({
    plugins: [
      dts({
        entryRoot: resolve(packageRoot, 'src'),
        exclude: [
          resolve(packageRoot, 'vite.config.ts'),
          resolve(packageRoot, 'test'),
          resolve(packageRoot, '**/*.spec.ts'),
        ],
        include: [resolve(packageRoot, 'src')],
        outDirs: [resolve(packageRoot, 'build')],
        tsconfigPath: resolve(packageRoot, 'tsconfig.json'),
      }),
    ],
    root: packageRoot,
    build: {
      emptyOutDir: true,
      minify: false,
      outDir: resolve(packageRoot, 'build'),
      sourcemap: false,
      ssr: resolve(packageRoot, 'src/index.ts'),
      target: 'es2020',
      rollupOptions: {
        external: id =>
          nodeBuiltins.has(id)
          || [...externalPackages].some(packageName => id === packageName || id.startsWith(`${packageName}/`)),
        output: {
          entryFileNames: 'index.js',
          exports: 'named',
          format: 'cjs',
          codeSplitting: false,
        },
      },
    },
  })
}
