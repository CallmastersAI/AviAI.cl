import * as fal from '@fal-ai/serverless-client';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkFal() {
    console.log("Checking Fal.ai configuration...");

    const key = process.env.FAL_KEY;
    if (!key) {
        console.error("❌ FAL_KEY is missing in .env file");
        process.exit(1);
    }

    console.log(`✅ Key found: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`);

    try {
        console.log("Attempting to connect to Fal.ai API...");

        console.log("Sending REAL test request to fal-ai/fast-sdxl...");

        const result: any = await fal.subscribe("fal-ai/fast-sdxl", {
            input: {
                prompt: "a cube",
                num_inference_steps: 4
            },
            logs: true,
            onQueueUpdate: (update: any) => {
                if (update.status === 'IN_PROGRESS') {
                    // console.log("Processing...");
                }
            }
        });

        if (result && result.images && result.images.length > 0) {
            console.log("✅ FAL API TEST SUCCESSFUL!");
            console.log("✅ Image generated: ", result.images[0].url);
            console.log("✅ Your Key and Credits work correctly.");
        } else {
            console.log("⚠️ API returned no images, but no error thrown.");
        }

    } catch (error: any) {
        console.error("\n❌ API REQUEST FAILED!");
        console.error("Error Message:", error.message);
        console.error("Details:", error.body || error);

        if (error.message.includes("403") || error.message.includes("Forbidden")) {
            console.log("\n👉 CAUSE: 'Forbidden'. This usually means:");
            console.log("   1. The API Key is invalid.");
            console.log("   2. You have ZERO credits (Fal.ai often requires adding $5-10 credits to start).");
        }
    }
}

checkFal();
