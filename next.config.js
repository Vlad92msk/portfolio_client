const Dotenv = require('dotenv-webpack')

module.exports = {
  webpack(config) {
    config.plugins.push(new Dotenv({ silent: true }));

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
  env: {
    CLIENT_HOST: process.env.CLIENT_HOST,
    SERVER_PORT: process.env.SERVER_PORT,
  },
}
