const express = require("express") // our express server
const cors = require('cors');
const bodyParser = require("body-parser") // requiring the body-parser
const db = require("./models/")
const Prometheus = require('prom-client');

const { collectDefaultMetrics, Registry } = Prometheus;

const metricsInterval = Prometheus.collectDefaultMetrics()
const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['route'],
  // buckets for response time from 0.1ms to 500ms
  buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500],
});

const app = express() // generate an app object
app.use(cors());

function success(res, payload) {
  return res.status(200).json(payload)
}
const PORT = process.env.PORT || 9000 // port that the server is running on => localhost:3000

app.use((req, res, next) => {
  res.locals.startEpoch = Date.now();
  next();
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(Prometheus.register.metrics())
});


app.use(bodyParser.json()) // telling the app that we are going to use json to handle incoming payload
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

app.use((req, res, next) => {
  const responseTimeInMs = Date.now(); - res.locals.startEpoch;

  httpRequestDurationMicroseconds
      .labels(req.method, req.originalUrl, res.statusCode)
      .observe(responseTimeInMs);

  next();
});

app.listen(PORT, () => {
  // listening on port 3000
  console.log(`listening on port ${PORT}`) // print this when the server starts
})

process.on('SIGTERM', () => {
  clearInterval(metricsInterval)

  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    process.exit(0)
  })
})


