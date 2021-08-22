const express = require("express") // our express server
const cors = require('cors');
const bodyParser = require("body-parser") // requiring the body-parser
const db = require("./models/")
const lynx = require("lynx");
const request = require("request");

const app = express() // generate an app object
const PORT = process.env.PORT || 9000 // port that the server is running on => localhost:3000
var opt = {};
opt.prefix = 'UsersSampleApp';
var metrics = new lynx('localhost', 8125, opt); // StatsD IP & Port

app.use(cors());
app.use(bodyParser.json()) // telling the app that we are going to use json to handle incoming payload


//Example1 - Hit Count Home Page
// app.get("/", (req, res) => {
//   res.send("Welcome to HomePage");
//   metrics.increment('HomePage.hitcount');
// });

// Example2 - Gauges App
app.get("/GaugesApp", (req, res) => {
  res.send("Welcome to GaugesApp Page");
  request.get({
    url : 'http://localhost:9000',
    time : true
  },function(err, response){
    console.log('MWI Request time in ms', response.elapsedTime);
    metrics.gauge('GaugesApp.usersApp', response.elapsedTime);
  });
  // request.get({
  //   url : 'https://www.google.com',
  //   time : true
  // },function(err, response1){
  //   console.log('Google Request time in ms', response1.elapsedTime);
  //   metrics.gauge('GaugesApp.google', response1.elapsedTime);
  // });
});


// //Example3 - Timer App
// app.get("/TimerApp", (req, res) => {
//   res.send("Welcome to TimerApp Page");
//   request.get({
//     url : 'https://www.middlewareinventory.com',
//     time : true
//   },function(err, response){
//     console.log('Request time in ms', response.elapsedTime);
//     metrics.timing('TimerApp.mwi', response.elapsedTime);
//   });
//
//   request.get({
//     url : 'https://www.google.com',
//     time : true
//   },function(err, response1){
//     console.log('Request time in ms', response1.elapsedTime);
//     metrics.timing('TimerApp.google', response1.elapsedTime);
//   });
// });


// //Example4 - User Defined Sets
// app.get("/Sets", (req, res) => {
//   metrics.set('Sets.user', 'Sarav');
//   metrics.set('Sets.user', 'Sarav');
//   if (Math.random() > 0.9)
//   {
//     metrics.set('Sets.user', 'Jarvis');
//   }
//   setTimeout(pick, 1000);
// });


function success(res, payload) {
  return res.status(200).json(payload)
}

app.get("/users", async (req, res, next) => {
  try {
    const users = await db.User.find({})
    metrics.increment('Users.hitcount');
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


