// /**
//  * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
//  * for Docker builds.
//  */
// import { dirname, resolve } from "path"
// import { fileURLToPath } from "url"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// await import("@/env")

// /** @type {import("next").NextConfig} */
// const nextConfig = {
//   // TypeScript config - linting and typechecking done separately in CI
//   typescript: { ignoreBuildErrors: true },

//   cacheLife: {
//     default: {
//       stale: 300, // 5 minutes
//       revalidate: 900, // 15 minutes
//       expire: 3600, // 1 hour
//     },
//     sessions: {
//       stale: 60, // 1 minute
//       revalidate: 300, // 5 minutes
//       expire: 900, // 15 minutes
//     },
//   },

//   // Enable experimental cache features
//   experimental: {
//     useCache: true,
//     // Try disabling Turbopack for builds to work around worker_threads issue
//     // This is a known Turbopack bug: https://github.com/vercel/next.js/issues/86099
//     // Setting this to false may help, but Next.js 16 uses Turbopack by default
//     // turbopack: false, // Uncomment if available in your Next.js version
//   },

//   // Mark pino, thread-stream, and Payload as external packages for server components
//   // This prevents Turbopack from trying to bundle them incorrectly
//   // In Next.js 16, this has been moved from experimental.serverComponentsExternalPackages
//   // Payload CMS uses pino internally, which uses thread-stream, which uses worker_threads
//   // NOTE: This is a known Turbopack limitation - it may still try to trace worker_threads
//   // during NFT (Node File Trace) phase, causing build failures
//   serverExternalPackages: [
//     "pino",
//     "thread-stream",
//     "pino-pretty",
//     "payload",
//     "@payloadcms/db-postgres",
//     "@payloadcms/richtext-slate",
//   ],

//   // Turbopack configuration
//   turbopack: {
//     rules: {
//       // Handle markdown files in node_modules (like README.md files)
//       // This prevents "Unknown module type" errors when Turbopack encounters .md files
//       "*.md": {
//         condition: {
//           // Match files in node_modules directory
//           path: /node_modules/,
//         },
//         loaders: ["raw-loader"],
//         as: "*.js",
//       },
//       // Comprehensive rule to exclude test files, binaries, and other non-production files
//       // This prevents Turbopack from trying to parse these files as production code
//       "*": {
//         condition: {
//           all: [
//             {
//               any: [
//                 { path: /node_modules/ },
//                 { path: /\/ROOT\/.*node_modules/ },
//               ],
//             },
//             {
//               any: [
//                 // Match test files
//                 { path: /\.test\.(js|ts|mjs|cjs)$/ },
//                 { path: /\.spec\.(js|ts|mjs|cjs)$/ },
//                 // Match test directories (including absolute paths)
//                 { path: /\/test\// },
//                 { path: /\/tests\// },
//                 { path: /\/__tests__\// },
//                 // Match LICENSE files
//                 { path: /\/LICENSE$/ },
//                 { path: /\/LICENSE\.(md|txt)$/ },
//                 // Match benchmark files
//                 { path: /\/bench\.(js|ts|mjs)$/ },
//                 { path: /\/benchmark\.(js|ts|mjs)$/ },
//                 // Match files with unknown extensions in test directories
//                 { path: /\/test\/.*\.(zip|sh|yml|yaml)$/ },
//                 // Match syntax error test files
//                 { path: /syntax-error\.(js|mjs)$/ },
//                 // Match esbuild binary specifically
//                 { path: /@esbuild\/.*\/bin\/esbuild$/ },
//                 // Match any file in bin directories without extension
//                 { path: /\/bin\/[^/]+$/ },
//                 // Match common executable extensions
//                 { path: /\.(exe|bin|so|dylib|dll)$/ },
//               ],
//             },
//           ],
//         },
//         loaders: [
//           {
//             loader: resolve(__dirname, "./src/lib/empty-loader.cjs"),
//           },
//         ],
//         as: "*.js",
//       },
//     },
//     // Resolve aliases to redirect problematic imports to empty module
//     resolveAlias: {
//       // Redirect esbuild binary imports to empty module
//       // This prevents Turbopack from trying to parse binary executables
//       "@esbuild/linux-x64/bin/esbuild": "./src/lib/empty-module.js",
//       // Redirect thread-stream test files to empty module
//       "thread-stream/test": "./src/lib/empty-module.js",
//       "thread-stream/bench": "./src/lib/empty-module.js",
//     },
//   },
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

try {
  const envPath = new URL("./src/env.js", import.meta.url).pathname
  await import(envPath)
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.log("env.js import failed, skipping:", errorMessage)
  // Continue without env validation
}

/** @type {import("next").NextConfig} */
const nextConfig = {
  // TypeScript config - linting and typechecking done separately in CI
  typescript: { ignoreBuildErrors: true },

  cacheLife: {
    default: {
      stale: 300, // 5 minutes
      revalidate: 900, // 15 minutes
      expire: 3600, // 1 hour
    },
    sessions: {
      stale: 60, // 1 minute
      revalidate: 300, // 5 minutes
      expire: 900, // 15 minutes
    },
  },

  // Enable experimental cache features but DISABLE Turbopack for production builds
  experimental: {
    useCache: true,
    // Disable Turbopack for production builds to avoid minification issues
    // turbopack: {
    //   // Only enable Turbopack in development for faster builds
    //   enabled: process.env.NODE_ENV === "development",
    // },
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

  // Generate source maps in production for debugging
  productionBrowserSourceMaps: true,

  // Use SWC minification instead of Terser for better compatibility
  // swcMinify: true,

  // Configure compiler options for better production builds
  compiler: {
    // Remove console.log in production except for errors
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  webpack: (config, { dev, isServer, buildId, webpack }) => {
    config.resolve.extensions = [".tsx", ".ts", ".jsx", ".js"]

    // Handle problematic modules
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
      // Use Terser with safe minification settings
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                // Safer compression to avoid "Ia" errors
                drop_debugger: true,
                drop_console: false, // Let Next.js compiler.handle this
                pure_funcs: ["console.log", "console.info", "console.debug"],
                passes: 2,
                // IMPORTANT: Disable aggressive optimizations that cause issues
                keep_fnames: true,
                keep_classnames: true,
                // Disable unsafe optimizations
                unsafe: false,
                unsafe_arrows: false,
                unsafe_comps: false,
                unsafe_math: false,
                unsafe_methods: false,
                unsafe_proto: false,
                unsafe_regexp: false,
                unsafe_undefined: false,
              },
              mangle: {
                // Use safe mangling to avoid "Ia" errors
                safari10: true,
                // Keep function names for debugging
                keep_fnames: true,
                keep_classnames: true,
                // Don't mangle top-level names
                toplevel: false,
                // Don't mangle properties
                properties: {
                  keep_quoted: true,
                  regex: undefined, // Don't mangle any properties
                },
              },
              format: {
                comments: false,
                beautify: false,
                ascii_only: true,
                // Keep braces for better debugging
                braces: true,
              },
              // Keep ECMAScript 5+ compatibility
              ecma: 5,
              // Source map for debugging
              sourceMap: true,
            },
            extractComments: false,
            parallel: true,
          }),
        ],
        // Use named chunk IDs for better debugging
        chunkIds: "named",
        moduleIds: "named",
        // Disable module concatenation if it causes issues
        concatenateModules: false,
        // Enable tree shaking but be conservative
        usedExports: true,
        sideEffects: "flag",
      }

      // Add environment variables
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env.NEXT_PHASE": JSON.stringify(buildId),
          "process.env.NODE_ENV": JSON.stringify("production"),
          "process.env.BUILD_ID": JSON.stringify(buildId),
        })
      )
    }

    // Add fallback for empty-loader if it exists
    try {
      const emptyLoaderPath = resolve(__dirname, "./src/lib/empty-loader.cjs")
      config.module.rules.push({
        test: /\.(test|spec)\.(js|ts)$/,
        include: /node_modules/,
        use: {
          loader: "null-loader",
        },
      })
    } catch (e) {
      // Ignore if empty-loader doesn't exist
    }

    return config
  },
}

export default nextConfig
