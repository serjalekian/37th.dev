/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add rule for GLSL files for webpack (used when Turbopack is disabled or for specific features)
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader"],
    });

    return config;
  },
  experimental: {
    turbo: {
      // Tell Turbopack which loader to use for .glsl files
      rules: {
        "**/*.glsl": {
          loaders: ["raw-loader"],
          as: "*.js", // Treat the output as JavaScript
        },
      },
      resolveExtensions: [
        // Keep this for potentially resolving imports correctly
        ".glsl",
        // Default extensions
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".json",
      ],
    },
  },
};

export default nextConfig;
