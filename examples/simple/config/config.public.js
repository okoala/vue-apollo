const ENV = process.env.NODE_ENV || 'development'

const config = {
  common: {
    host: 'sam.dev',
    port: process.env.PORT || 3000
  },
  development: {

  },
  production: {

  }
}

module.exports = Object.assign(config.common, config[ENV])
