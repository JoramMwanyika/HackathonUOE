
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const farm = await db.farm.findFirst({
            where: { userId: session.user.id },
            include: {
                blocks: {
                    include: {
                        readings: {
                            orderBy: { timestamp: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!farm) {
            return NextResponse.json({ error: "Farm not found" }, { status: 404 });
        }

        return NextResponse.json(farm);
    } catch (error) {
        console.error("Fetch farm error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
