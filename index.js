const express = require("express") // our express server
const cors = require('cors');
const bodyParser = require("body-parser") // requiring the body-parser
const db = require("./models/")
const appmetrics = require('appmetrics');
const http = require('http');

const app = express() // generate an app object
const PORT = process.env.PORT || 9000 // port that the server is running on => localhost:3000

app.use(cors());
app.use(bodyParser.json()) // telling the app that we are going to use json to handle incoming payload

function success(res, payload) {
  return res.status(200).json(payload)
}

const monitoring = appmetrics.monitor();

monitoring.on('cpu', (cpu) => {
  const postData = `cpu_percentage,host=NodeApi process=${cpu.process},system=${cpu.system} ${cpu.time}`;

  const options = {
    port: 8186,
    path: '/write?precision=ms',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
});


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
  console.log(`listening on port ${PORT}`) // print this when the server starts
})


