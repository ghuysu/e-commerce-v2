const compression = require("compression")
const express = require("express")
const { default: helmet } = require("helmet")
const morgan = require("morgan")
const dotenv = require("dotenv").config()

const app = express()


//init middlewares
app.use(morgan("dev"))
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))
//init db
const db = require("./dbs/init.mongoose")
const {checkOverload} = require("./helpers/check.connect")
checkOverload()

//init routers
app.use("/", require('./routers'))

//handling error

module.exports = app