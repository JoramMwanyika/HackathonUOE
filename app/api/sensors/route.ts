import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') || 'en';

    try {
        // Fetch unique block IDs first
        // Since distinct is limited in some SQLite versions via Prisma, we'll fetch latest readings
        // We want the LATEST reading for each block.

        // 1. Get all readings
        // Optimization: In a real app, use a raw query or optimizing grouping. 
        // Here we'll fetch recent readings and dedup in JS for simplicity on this small scale.
        const readings = await db.sensorReading.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20 // Get last 20 readings
        });

        if (readings.length === 0) {
            // Return seeded/simulated data if DB is empty
            return NextResponse.json(generateSimulatedData(lang));
        }

        // Dedup to get latest per blockId
        const latestMap = new Map();
        // Reverse needed because we fetched desc, we want to keep the FIRST occurrence (latest)
        for (const r of readings) {
            if (!latestMap.has(r.blockId)) {
                latestMap.set(r.blockId, r);
            }
        }

        const blocks = Array.from(latestMap.values()).map(r => ({
            id: r.blockId,
            name: getLocalizedBlockName(r.blockName, lang),
            healthStatus: getLocalizedStatus(r.healthStatus, lang),
            progress: r.progress,
            moisture: r.moisture,
            temp: r.temp,
            lastUpdated: r.createdAt
        }));

        // Sort by ID
        blocks.sort((a, b) => a.id - b.id);

        return NextResponse.json({ blocks });
    } catch (error) {
        console.error("DB Error:", error);
        // Fallback to simulation on error
        return NextResponse.json(generateSimulatedData(lang));
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        if (!data.blocks || !Array.isArray(data.blocks)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Save to DB
        for (const block of data.blocks) {
            await db.sensorReading.create({
                data: {
                    blockId: block.id,
                    blockName: block.name,
                    healthStatus: block.healthStatus || "good",
                    progress: block.progress || 50,
                    moisture: block.moisture,
                    temp: block.temp
                }
            });
        }

        return NextResponse.json({ success: true, message: "Data saved to DB" });
    } catch (error) {
        console.error("Post Error:", error);
        return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
    }
}

function getLocalizedBlockName(name: string, lang: string): string {
    if (lang !== 'sw') return name;

    // Simple mapping for demo purposes
    if (name.includes("Maize")) return name.replace("Maize", "Mahindi").replace("Block", "Shamba");
    if (name.includes("Beans")) return name.replace("Beans", "Maharagwe").replace("Block", "Shamba");
    if (name.includes("Greenhouse")) return "Kitalu cha Mboga";

    return name;
}

function getLocalizedStatus(status: string, lang: string): string {
    if (lang !== 'sw') return status;

    const map: Record<string, string> = {
        'healthy': 'afya njema',
        'warning': 'tahadhari',
        'critical': 'hatari',
        'good': 'nzuri'
    };

    return map[status.toLowerCase()] || status;
}

function generateSimulatedData(lang: string = 'en') {
    const now = Date.now();
    const isSwahili = lang === 'sw';

    return {
        blocks: [
            {
                id: 1,
                name: isSwahili ? "Shamba A - Mahindi (Simulated DB)" : "Block A - Maize (Simulated DB)",
                healthStatus: isSwahili ? "afya njema" : "healthy",
                progress: 60,
                moisture: Math.floor(45 + Math.sin(now / 10000) * 5),
                temp: Math.floor(22 + Math.cos(now / 10000) * 3),
            },
            {
                id: 2,
                name: isSwahili ? "Shamba B - Maharagwe (Simulated DB)" : "Block B - Beans (Simulated DB)",
                healthStatus: isSwahili ? "tahadhari" : "warning",
                progress: 85,
                moisture: Math.floor(30 + Math.sin(now / 12000) * 5),
                temp: Math.floor(24 + Math.cos(now / 12000) * 4),
            },
            {
                id: 3,
                name: isSwahili ? "Kitalu cha Mboga (Simulated DB)" : "Greenhouse (Simulated DB)",
                healthStatus: isSwahili ? "afya njema" : "healthy",
                progress: 50,
                moisture: 65,
                temp: 26,
            }
        ]
    };
}
