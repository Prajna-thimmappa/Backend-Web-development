
const crypto = require("crypto");
const assert = require("assert");

const SECRET = "supersecretkey";
const URL = "http://localhost:3000/webhooks";

function generateSignature(payload) {
    return "sha256=" + crypto
        .createHmac("sha256", SECRET)
        .update(payload)
        .digest("hex");
}

async function sendWebhook(payload, signature) {
    return fetch(URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-webhook-signature": signature
        },
        body: payload
    });
}

async function runTests() {
    try {
        // Test 1: Valid webhook
        const event = JSON.stringify({
            id: "event-101",
            type: "payment.success"
        });

        const signature = generateSignature(event);
        const response1 = await sendWebhook(event, signature);
        const result1 = await response1.json();

        assert.strictEqual(response1.status, 200);
        assert.strictEqual(result1.status, "received");
        console.log("Test 1 passed: Valid webhook");

        // Test 2: Duplicate event
        const response2 = await sendWebhook(event, signature);
        const result2 = await response2.json();

        assert.strictEqual(response2.status, 200);
        assert.strictEqual(result2.status, "already_processed");
        console.log("Test 2 passed: Duplicate event");

        // Test 3: Invalid signature
        const response3 = await sendWebhook(event, "sha256=invalid");
        assert.strictEqual(response3.status, 401);
        console.log("Test 3 passed: Invalid signature");

        console.log("\nAll tests passed!");

    } catch (error) {
        console.error("Test failed:", error.message);
        process.exitCode = 1;
    }
}

runTests();
