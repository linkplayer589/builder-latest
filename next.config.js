// /**
//  * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
//  * for Docker builds.
//  */
// import { dirname, resolve } from "path"
// import { fileURLToPath } from "url"
// import TerserPlugin from "terser-webpack-plugin"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// /** @type {import("next").NextConfig} */
// const nextConfig = {
//   // TypeScript config - linting and typechecking done separately in CI
//   typescript: { ignoreBuildErrors: true },

//   experimental: {
//     useCache: true,
//   },
//   // turbopack: {}, // Disable Turbopack until more stable

//   // Mark pino, thread-stream, and Payload as external packages for server components
//   serverExternalPackages: [
//     "pino",
//     "thread-stream",
//     "pino-pretty",
//     "payload",
//     "@payloadcms/db-postgres",
//     "@payloadcms/richtext-slate",
//   ],

//   // Configure production optimizations carefully
//   // swcMinify: false, // Use Terser instead of SWC minifier for better control

//   webpack: (config, { dev, isServer, buildId, webpack }) => {
//     config.resolve.extensions = [".tsx", ".ts", ".jsx", ".js"]

//     config.resolve.alias = config.resolve.alias || {}
//     config.resolve.alias["@"] = resolve(__dirname, "src")
//     config.resolve.alias["@/env"] = resolve(__dirname, "src/env.mjs")

//     // Exclude binary files and README files from processing
//     if (isServer) {
//       config.module = config.module || {}
//       config.module.rules = config.module.rules || []

//       // Ignore binary files and README files from node_modules
//       config.module.rules.push({
//         test: /\.(md|bin)$/,
//         type: "asset/resource",
//       })

//       // Ignore esbuild platform-specific binaries
//       config.resolve.alias["@esbuild/linux-x64/bin/esbuild"] = false
//     }

//     // Ignore problematic files in node_modules
//     config.externals = config.externals || []
//     if (Array.isArray(config.externals)) {
//       config.externals.push({
//         "@esbuild/linux-x64": "commonjs @esbuild/linux-x64",
//       })
//     }

//     // Production build optimizations with controlled minification
//     if (!dev && !isServer) {
//       // Keep optimization but configure it carefully
//       config.optimization = {
//         ...config.optimization,
//         minimize: true,
//         minimizer: [
//           new TerserPlugin({
//             terserOptions: {
//               compress: {
//                 // Disable aggressive name mangling
//                 keep_classnames: true,
//                 keep_fnames: true,
//                 // Keep variable names readable for debugging
//                 keep_fargs: true,
//                 // Disable property mangling
//                 // keep_quoted: true,
//                 // Safer compression options
//                 drop_debugger: true,
//                 drop_console: true,
//                 pure_funcs: ["console.log", "console.info", "console.debug"],
//                 passes: 2,
//               },
//               mangle: {
//                 // Configure mangling carefully
//                 keep_classnames: true,
//                 keep_fnames: true,
//                 // Use a deterministic mangling to avoid issues
//                 safari10: true,
//                 // Don't mangle properties
//                 properties: false,
//                 // Don't mangle top-level names
//                 toplevel: false,
//               },
//               format: {
//                 comments: false,
//                 beautify: false,
//                 // Keep ASCII safe
//                 ascii_only: true,
//               },
//               // Source map for debugging
//               sourceMap: true,
//             },
//             extractComments: false,
//             parallel: true,
//           }),
//         ],
//         // Keep readable chunk names
//         chunkIds: "deterministic",
//         moduleIds: "deterministic",
//         // Enable module concatenation safely
//         concatenateModules: true,
//         // Enable tree shaking
//         usedExports: true,
//         sideEffects: true,
//       }

//       // Performance hints
//       config.performance = {
//         ...config.performance,
//         hints: "warning",
//         maxAssetSize: 250000,
//         maxEntrypointSize: 250000,
//       }

//       // Add a plugin to identify the problematic module
//       config.plugins.push(
//         new webpack.DefinePlugin({
//           "process.env.NEXT_PHASE": JSON.stringify(buildId),
//           "process.env.NODE_ENV": JSON.stringify("production"),
//         })
//       )

//       // Add source map for better debugging
//       if (!config.devtool) {
//         config.devtool = "source-map"
//       }
//     }

//     return config
//   },

//   // Generate source maps in production for debugging
//   productionBrowserSourceMaps: true,
// }

// export default nextConfig

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import TerserPlugin from "terser-webpack-plugin"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import("next").NextConfig} */
const nextConfig = {
  // TypeScript config - linting and typechecking done separately in CI
  typescript: { ignoreBuildErrors: true },

  experimental: {
    useCache: true,
  },

  // Mark pino, thread-stream, and Payload as external packages for server components
  serverExternalPackages: [
    "pino",
    "thread-stream",
    "pino-pretty",
    "payload",
    "@payloadcms/db-postgres",
    "@payloadcms/richtext-slate",
  ],

  compiler: {
    // Enable SWC minification (faster than Terser)
    removeConsole: !process.env.NEXT_PUBLIC_DEBUG,
  },

  // Configure production optimizations carefully

  webpack: (config, { dev, isServer, buildId, webpack }) => {
    config.resolve.extensions = [".tsx", ".ts", ".jsx", ".js", ".json"]

    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias["@"] = resolve(__dirname, "src")
    config.resolve.alias["@/env"] = resolve(__dirname, "src/env.mjs")

    // Performance improvement: cache generated modules
    if (!dev) {
      config.cache = {
        type: "filesystem",
        compression: "gzip",
        buildDependencies: {
          config: [__filename],
        },
      }
    }

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
      config.resolve.alias["@esbuild/linux-x64/bin/esbuild"] = false
    }

    // Ignore problematic files in node_modules
    config.externals = config.externals || []
    if (Array.isArray(config.externals)) {
      config.externals.push({
        "@esbuild/linux-x64": "commonjs @esbuild/linux-x64",
      })
    }

    // Production build optimizations
    if (!dev && !isServer) {
      // Configure Terser for optimal minification
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          new TerserPlugin({
            parallel: true,
            extractComments: {
              condition: /^\**!|@preserve|@license|@cc_on/i,
              filename: "LICENSES.txt",
              banner: () => "License information can be found in LICENSES.txt",
            },
            terserOptions: {
              parse: {
                ecma: 2020,
              },
              compress: {
                ecma: 5,
                comparisons: false,
                inline: 2,
                // Safe optimizations
                drop_console: process.env.NEXT_PUBLIC_DEBUG ? false : true,
                drop_debugger: true,
                pure_funcs: process.env.NEXT_PUBLIC_DEBUG
                  ? []
                  : [
                      "console.log",
                      "console.info",
                      "console.debug",
                      "console.warn",
                    ],
                // Remove dead code
                dead_code: true,
                // Remove unreachable code
                conditionals: true,
                // Evaluate constant expressions
                evaluate: true,
                // Optimize booleans
                booleans: true,
                // Optimize loops
                loops: true,
                // Remove unused variables
                unused: true,
                // Optimize if statements
                if_return: true,
                // Join consecutive var statements
                join_vars: true,
                // Drop unused function arguments
                arguments: true,
                // Optimize properties
                properties: true,
              },
              mangle: {
                safari10: false,
                // Better for gzip compression
                keep_classnames: false,
                keep_fnames: false,
                // Mangle options for better compression
                toplevel: true,
                reserved: ["$", "exports", "require"],
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
                // Better for gzip compression
                beautify: false,
              },
              // Enable for debugging if needed
              sourceMap: false,
            },
          }),
        ],
        // Better for long-term caching
        moduleIds: "deterministic",
        chunkIds: "deterministic",
        // Enable tree shaking
        usedExports: true,
        sideEffects: true,
        // Better code splitting
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
        // Remove empty chunks
        removeEmptyChunks: true,
        // Merge duplicate chunks
        mergeDuplicateChunks: true,
        // Flag included chunks as available for tree shaking
        providedExports: true,
      }

      // Performance hints
      config.performance = {
        ...config.performance,
        hints: "warning",
        maxAssetSize: 244000, // 244KB
        maxEntrypointSize: 488000, // 488KB
        assetFilter: function (/** @type {string} */ assetFilename) {
          return !/\.(map|txt|md|bin)$/.test(assetFilename)
        },
      }

      // Optimize source maps
      if (process.env.NEXT_PUBLIC_DEBUG) {
        config.devtool = "source-map"
      }

      // Add environment variables
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(
            dev ? "development" : "production"
          ),
          "process.env.BUILD_ID": JSON.stringify(buildId),
        })
      )

      // Optimize module concatenation
      if (config.optimization.concatenateModules === undefined) {
        config.optimization.concatenateModules = true
      }
    }

    return config
  },

  // Generate source maps in production for debugging
  productionBrowserSourceMaps: process.env.NEXT_PUBLIC_DEBUG === "true",
}

export default nextConfig
