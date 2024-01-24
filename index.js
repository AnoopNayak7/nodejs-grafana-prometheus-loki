const express = require('express');
const client = require('prom-client')
const { expensiveHeavyTask } = require('./utils');

const app = express();
const PORT = process.env.PORT || 8000;

const collectDefaultMetrics = client.collectDefaultMetrics;

console.log(collectDefaultMetrics)

collectDefaultMetrics({ register: client.register})


app.get("/", (req, res) => {
    return res.json({ message: `Hello from Express Server` });
})

app.get("/slow", async (req, res) => {
    try {
        const timeTaken = await expensiveHeavyTask();
        return res.json({
            status: "success",
            message: `Heavy task completed in ${timeTaken}`
        })
    } catch (error) {
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