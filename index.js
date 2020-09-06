const express = require("express") // our express server
const cors = require('cors');
const bodyParser = require("body-parser") // requiring the body-parser
const db = require("./models/")

const app = express() // generate an app object
const PORT = process.env.PORT || 9000 // port that the server is running on => localhost:3000

app.use(cors());
app.use(bodyParser.json()) // telling the app that we are going to use json to handle incoming payload

function success(res, payload) {
  return res.status(200).json(payload)
}

app.get("/users", async (req, res, next) => {
  try {
    const users = await db.User.find({})
    return success(res, users)
  } catch (err) {
    next({ status: 400, message: "failed to get users" })
  }
})

app.post("/users", async (req, res, next) => {
  try {
    const user = await db.User.create(req.body)
    return success(res, user)
  } catch (err) {
    next({ status: 400, message: "failed to create user" })
  }
})

app.put("/users/:id", async (req, res, next) => {
  try {
    const user = await db.User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    return success(res, user)
  } catch (err) {
    next({ status: 400, message: "failed to update user" })
  }
})
app.delete("/users/:id", async (req, res, next) => {
  try {
    await db.User.findByIdAndRemove(req.params.id)
    return success(res, "user deleted!")
  } catch (err) {
    next({ status: 400, message: "failed to delete user" })
  }
})

app.use((err, req, res, next) => {
  return res.status(err.status || 400).json({
    status: err.status || 400,
    message: err.message || "there was an error processing request",
  })
})

app.listen(PORT, () => {
  // listening on port 3000
  console.log(`listening on port ${PORT}`) // print this when the server starts
})


