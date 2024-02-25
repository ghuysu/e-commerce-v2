const app = require("./src/app");
const config = require("./src/configs/config.mongodb")
const PORT = config.app.port || 3052 

const server = app.listen(PORT, () => {
    console.log(`WSV E-Commerce start with ${PORT}`)
})

process.on("SIGINT", () => {
    server.close( () => console.log("Exited Server Express"))
})