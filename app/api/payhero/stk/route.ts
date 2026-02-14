import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { initiateSTKPush } from "@/lib/payhero";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { phone } = await req.json();

        // Amount is fixed for this feature
        const amount = 10;

        const result = await initiateSTKPush({
            phone,
            amount,
            userId: session.user.id
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
