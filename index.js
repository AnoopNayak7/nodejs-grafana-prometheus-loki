const express = require('express');
const responseTime = require('response-time')
const client = require('prom-client')
const { expensiveHeavyTask } = require('./utils');
const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");
const options = {
  transports: [
    new LokiTransport({
      host: "http://127.0.0.1:3100"
    })
  ]
};
const logger = createLogger(options);

const app = express();
const PORT = process.env.PORT || 8000;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register});

const reqResTime = new client.Histogram({
    name: "http_express_req_res_time",
    help: "This tells how much time is taken by req and res",
    labelNames: ['method', 'route', 'status_code'],
    buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000]
});

const totalRequestCounter = new client.Counter({
    name: 'total_req',
    help: 'tells total count of request'
})

app.use(responseTime((req, res, time) => {
    totalRequestCounter.inc();
    reqResTime.labels({
        method: req.method,
        route: req.url,
        status_code: res.statusCode
    }).observe(time);
}));


app.get("/", (req, res) => {
    logger.info("Req is coming from / ")
    return res.json({ message: `Hello from Express Server` });
})

app.get("/slow", async (req, res) => {
    try {
        logger.info("Req is coming from /slow ")
        const timeTaken = await expensiveHeavyTask();
        return res.json({
            status: "success",
            message: `Heavy task completed in ${timeTaken}`
        })
    } catch (error) {
        logger.error("Req is coming from : ERROR", error)
        return res.status(500).json({status: "Error", error: 'Internal server error'})
    }
})

app.get("/metrics", async(req, res) =>{
    res.setHeader('Content-Type', client.register.contentType)
    const metrics = await client.register.metrics();
    res.send(metrics)
})

app.listen(PORT, () => {
    console.log(`Server running on PORT : ${PORT}`)
})