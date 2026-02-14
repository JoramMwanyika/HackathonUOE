import { db } from "./db";

const PAYHERO_API_URL = "https://backend.payhero.co.ke/api/v2";
const PAYHERO_API_TOKEN = process.env.PAYHERO_API_TOKEN;
const CALLBACK_URL = process.env.PAYHERO_CALLBACK_URL;
const PAYHERO_CHANNEL_ID = parseInt(process.env.PAYHERO_CHANNEL_ID || "4639");

export async function initiateSTKPush({
    phone,
    amount,
    userId,
}: {
    phone: string;
    amount: number;
    userId: string;
}) {
    if (!PAYHERO_API_TOKEN) {
        throw new Error("PayHero API Token missing");
    }

    // Prepare Request
    const body = {
        amount,
        phone_number: phone,
        channel_id: PAYHERO_CHANNEL_ID,
        provider: "m-pesa",
        external_reference: userId,
        callback_url: CALLBACK_URL,
    };

    try {
        const response = await fetch(`${PAYHERO_API_URL}/payments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${PAYHERO_API_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("PayHero API Error:", {
                status: response.status,
                statusText: response.statusText,
                data
            });
            throw new Error(data.message || `Failed to initiate STK Push: ${response.status} ${JSON.stringify(data)}`);
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
