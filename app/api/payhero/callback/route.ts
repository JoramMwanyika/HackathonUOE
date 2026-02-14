import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const data = await req.json();
        console.log("PayHero Callback:", data);

        // PayHero Callback Structure (Example - verify with docs)
        // {
        //   "success": true,
        //   "response": {
        //       "CheckoutRequestID": "...",
        //       "MpesaReceiptNumber": "...",
        //       "Amount": 10,
        //       "PhoneNumber": "..."
        //   },
        //   "external_reference": "userId"
        // }

        if (data.success) {
            const receipt = data.response.MpesaReceiptNumber;
            const checkoutId = data.response.CheckoutRequestID;
            const userId = data.external_reference;

            // Update Payment Record
            await db.payment.updateMany({
                where: { reference: checkoutId },
                data: {
                    status: "COMPLETED",
                    externalId: receipt
                }
            });

            // Grant Market Access
            if (userId) {
                // Add 24 hours access
                const expiry = new Date();
                expiry.setHours(expiry.getHours() + 24);

                console.log(`Granting access to user ${userId} until ${expiry}`);

                await db.user.update({
                    where: { id: userId },
                    data: { marketAccessExpiry: expiry } as any
                });
            }
        } else {
            // Handle Failure
            const checkoutId = data.response?.CheckoutRequestID;
            if (checkoutId) {
                await db.payment.updateMany({
                    where: { reference: checkoutId },
                    data: { status: "FAILED" }
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Callback Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
