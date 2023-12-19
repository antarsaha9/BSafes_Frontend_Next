/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  webpack: (config, { isServer }) => {
    if (!isServer) {
        // don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
        config.resolve.fallback = {
          path: false,
          fs: false,
          Buffer: false,
          process: false,
        }
    }

    config.experiments = { 
      asyncWebAssembly: true,
      layers: true
    };

    config.module.rules.push({
      test: /\.wasm$/,
      loader: "base64-loader",
      type: "javascript/auto",
    });
  
    config.module.noParse = /\.wasm$/;
  
    config.module.rules.forEach(rule => {
      (rule.oneOf || []).forEach(oneOf => {
          if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
              oneOf.exclude.push(/\.wasm$/);
          }
      });
    });
    
    return config;
  }
}

module.exports = nextConfig

