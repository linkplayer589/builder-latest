/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { existsSync } from "fs"
import { dirname, join, resolve } from "path"
import { fileURLToPath } from "url"
import TerserPlugin from "terser-webpack-plugin"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envPathSrc = join(__dirname, "src", "env.js")
const envPathRoot = join(__dirname, "env.js")

if (existsSync(envPathSrc)) {
  await import(envPathSrc)
} else if (existsSync(envPathRoot)) {
  await import(envPathRoot)
} else {
  console.log("No env.js found - skipping")
}

/** @type {import("next").NextConfig} */
const nextConfig = {
  // TypeScript config - linting and typechecking done separately in CI
  typescript: { ignoreBuildErrors: true },

  experimental: {
    useCache: true,
  },
  // turbopack: {}, // Disable Turbopack until more stable

  // Mark pino, thread-stream, and Payload as external packages for server components
  serverExternalPackages: [
    "pino",
    "thread-stream",
    "pino-pretty",
    "payload",
    "@payloadcms/db-postgres",
    "@payloadcms/richtext-slate",
  ],

  // Configure production optimizations carefully
  // swcMinify: false, // Use Terser instead of SWC minifier for better control

  webpack: (config, { dev, isServer, buildId, webpack }) => {
    config.resolve.extensions = [".tsx", ".ts", ".jsx", ".js"]

    // Exclude binary files and README files from processing
    if (isServer) {
      config.module = config.module || {}
      config.module.rules = config.module.rules || []

      // Ignore binary files and README files from node_modules
      config.module.rules.push({
        test: /\.(md|bin)$/,
        type: "asset/resource",
      })

      // Ignore esbuild platform-specific binaries
      config.resolve.alias = config.resolve.alias || {}
      config.resolve.alias["@esbuild/linux-x64/bin/esbuild"] = false
    }

    // Ignore problematic files in node_modules
    config.externals = config.externals || []
    if (Array.isArray(config.externals)) {
      config.externals.push({
        "@esbuild/linux-x64": "commonjs @esbuild/linux-x64",
      })
    }

    // Production build optimizations with controlled minification
    if (!dev && !isServer) {
      // Keep optimization but configure it carefully
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                // Disable aggressive name mangling
                keep_classnames: true,
                keep_fnames: true,
                // Keep variable names readable for debugging
                keep_fargs: true,
                // Disable property mangling
                // keep_quoted: true,
                // Safer compression options
                drop_debugger: true,
                drop_console: true,
                pure_funcs: ["console.log", "console.info", "console.debug"],
                passes: 2,
              },
              mangle: {
                // Configure mangling carefully
                keep_classnames: true,
                keep_fnames: true,
                // Use a deterministic mangling to avoid issues
                safari10: true,
                // Don't mangle properties
                properties: false,
                // Don't mangle top-level names
                toplevel: false,
              },
              format: {
                comments: false,
                beautify: false,
                // Keep ASCII safe
                ascii_only: true,
              },
              // Source map for debugging
              sourceMap: true,
            },
            extractComments: false,
            parallel: true,
          }),
        ],
        // Keep readable chunk names
        chunkIds: "deterministic",
        moduleIds: "deterministic",
        // Enable module concatenation safely
        concatenateModules: true,
        // Enable tree shaking
        usedExports: true,
        sideEffects: true,
      }

      // Performance hints
      config.performance = {
        ...config.performance,
        hints: "warning",
        maxAssetSize: 250000,
        maxEntrypointSize: 250000,
      }

      // Add a plugin to identify the problematic module
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env.NEXT_PHASE": JSON.stringify(buildId),
          "process.env.NODE_ENV": JSON.stringify("production"),
        })
      )

      // Add source map for better debugging
      if (!config.devtool) {
        config.devtool = "source-map"
      }
    }

    return config
  },

  // Generate source maps in production for debugging
  productionBrowserSourceMaps: true,
}

export default nextConfig
