
require("dotenv").config();

const express = require("express");
const { handleWebhook } = require("./webhookHandler");

const app = express();

// Keep the original request body as a Buffer
app.use("/webhooks", express.raw({ type: "application/json" }));

// Webhook endpoint
app.post("/webhooks", handleWebhook);

// Start server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});

module.exports = app;
