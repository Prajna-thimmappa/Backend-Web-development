
const crypto = require("crypto");
const { handleEvent } = require("./eventHandlers");

// Store processed event IDs
const _processedIds = new Set();

function handleWebhook(req, res) {
    try {
        // 1. Get the signature from request headers
        const signature = req.headers["x-webhook-signature"];
        const secret = process.env.WEBHOOK_SECRET;

        if (!signature || !secret || !Buffer.isBuffer(req.body)) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        // 2. Generate expected HMAC SHA256 signature
        const expectedSignature =
            "sha256=" +
            crypto
                .createHmac("sha256", secret)
                .update(req.body)
                .digest("hex");

        // 3. Compare signatures safely
        const receivedBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);

        if (
            receivedBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
        ) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        // 4. Parse the event
        const event = JSON.parse(req.body.toString());

        if (!event.id) {
            return res.status(400).json({ error: "Event ID is required" });
        }

        // 5. Check for duplicate events
        if (_processedIds.has(event.id)) {
            return res.status(200).json({
                status: "already_processed"
            });
        }

        // 6. Mark event as processed
        _processedIds.add(event.id);

        // 7. Respond immediately
        res.status(200).json({ status: "received" });

        // 8. Process event asynchronously
        setImmediate(() => handleEvent(event));

    } catch (error) {
        return res.status(400).json({ error: "Invalid webhook payload" });
    }
}

module.exports = { handleWebhook, _processedIds };
