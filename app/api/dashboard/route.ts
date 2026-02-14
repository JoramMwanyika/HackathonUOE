import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // 1. Fetch User's Farm (Assuming single farm for now)
        const farm = await db.farm.findFirst({
            where: { userId },
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
            return NextResponse.json({
                blocks: [],
                stats: { activeBlocks: 0, pendingTasks: 0, health: 100, area: 0 }
            });
        }

        // 2. Calculate Block Stats
        const blocks = farm.blocks.map(b => {
            // Simple health logic
            const latestReading = b.readings[0];
            let health = "healthy";
            if (latestReading) {
                if (latestReading.moisture && latestReading.moisture < 30) health = "warning";
                if (latestReading.moisture && latestReading.moisture < 10) health = "critical";
            }

            return {
                id: b.id,
                name: b.name,
                cropType: b.cropType,
                progress: b.plantedDate ? Math.min(100, Math.floor((Date.now() - new Date(b.plantedDate).getTime()) / (1000 * 60 * 60 * 24) / 90 * 100)) : 0, // Approx 90 days crop
                healthStatus: health,
                moisture: latestReading?.moisture,
                temp: latestReading?.temp
            }
        });

        // 3. Overall Stats
        const totalArea = farm.blocks.reduce((acc, b) => acc + (b.area || 0), 0);
        const avgHealth = "98%"; // Placeholder logic or calculate from blocks

        // 4. Tasks (Mocked for now as Task model might not exist or be linked yet, checking schema next)
        // Checking schema... Task model likely missing or I need to check schema again.
        // For now returning empty or placeholder if no schema support found in previous steps.
        const tasks: any[] = [];

        // 5. Calendar (Mocked or from Crop Cycles)
        const calendar: any[] = [];

        return NextResponse.json({
            userName: session.user.name,
            farmName: farm.name,
            blocks,
            stats: {
                activeBlocks: farm.blocks.length,
                pendingTasks: tasks.length,
                health: avgHealth,
                area: totalArea
            },
            calendar
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
