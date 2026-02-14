import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Grant 24 hours access
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);

        await db.user.update({
            where: { id: userId },
            data: { marketAccessExpiry: expiry } as any
        });

        // Create a mock payment record for history
        await db.payment.create({
            data: {
                userId,
                amount: 10,
                status: "COMPLETED",
                phoneNumber: "SIMULATED",
                reference: `SIM-${Date.now()}`,
                description: "Local Simulation Unlock",
                externalId: "SIMULATED_RECEIPT"
            }
        });

        return NextResponse.json({ success: true, message: "Market access granted via simulation" });
    } catch (error: any) {
        console.error("Simulation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
