const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3052,
    },
    db: {
        username: process.env.DEV_DB_USERNAME || "daogiahuysu",
        password: process.env.DEV_DB_PASSWORD || "HuyUyen-07021011",
        name: process.env.DEV_DB_NAME || "shopDEV",
    }
}

const prod = {
    app: {
        port: process.env.DEV_APP_PORT || 3000,
    },
    db: {
        username: process.env.PROD_DB_USERNAME || "daogiahuysu",
        password: process.env.PROD_DB_PASSWORD || "HuyUyen-07021011",
        name: process.env.PROD_DB_NAME || "shopPROD",
    }
}

const config = {
    dev,
    prod
}
const env = process.env.NODE_ENV || "dev"

module.exports = config[env]