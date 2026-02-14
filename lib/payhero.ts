import { db } from "./db";

const PAYHERO_API_URL = "https://backend.payhero.co.ke/api/v2";
const PAYHERO_USERNAME = process.env.PAYHERO_USERNAME;
const PAYHERO_PASSWORD = process.env.PAYHERO_PASSWORD;
const CALLBACK_URL = process.env.PAYHERO_CALLBACK_URL; // Must be public URL

export async function initiateSTKPush({
    phone,
    amount,
    userId,
}: {
    phone: string;
    amount: number;
    userId: string;
}) {
    if (!PAYHERO_USERNAME || !PAYHERO_PASSWORD) {
        throw new Error("PayHero credentials missing");
    }

    // 1. Get Basic Auth Token
    const auth = Buffer.from(`${PAYHERO_USERNAME}:${PAYHERO_PASSWORD}`).toString("base64");

    // 2. Prepare Request
    const body = {
        amount,
        phone_number: phone,
        channel_id: 2855, // 2855 is common PayHero Test Channel / Default. Check docs for specific channel ID.
        provider: "m-pesa",
        external_reference: userId, // Pass userId as reference to track
        callback_url: CALLBACK_URL,
    };

    try {
        const response = await fetch(`${PAYHERO_API_URL}/services/winter/stk/initiate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to initiate STK Push");
        }

        // 3. Create Pending Payment Record
        await db.payment.create({
            data: {
                userId,
                amount,
                status: "PENDING",
                phoneNumber: phone,
                reference: data.checkout_request_id || data.reference, // Adjust based on actual API response
                description: "Market Access Unlock"
            }
        });

        return data;
    } catch (error) {
        console.error("PayHero Error:", error);
        throw error;
    }
}
