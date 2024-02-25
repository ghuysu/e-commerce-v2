"user strict"

const { default: mongoose } = require("mongoose")
const {countConnect} = require("../helpers/check.connect")
const {db} = require("../configs/config.mongodb");

const connectionsString = `mongodb+srv://${db.username}:${db.password}@cluster0.ibftatx.mongodb.net/${db.name}`

class Database {
    constructor() {
        this.connect()
    }

    //connect  
    connect(type = 'mongodb'){
        if(1 === 1){
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }

        mongoose.connect(connectionsString)
         .then(_ => {
            console.log("Connected Mongodb Successfully")
            countConnect()
         })
         .catch(err => console.log("Error Connect"))
    }

    static getInstance(){
        if(!Database.instance){
            Database.instance = new Database()
        }

        return Database.instance
    }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb