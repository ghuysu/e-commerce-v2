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
app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    console.error(error)
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: "Error",
        code: statusCode,
        message: error.message || 'Internal Server Error'
    })
})

module.exports = app