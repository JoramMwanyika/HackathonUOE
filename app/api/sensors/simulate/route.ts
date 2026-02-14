
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
    try {
        const blocks = await db.block.findMany();

        if (blocks.length === 0) {
            return NextResponse.json({ message: "No blocks found" });
        }

        const updates = [];

        for (const block of blocks) {
            // Base values per crop
            let baseMoisture = 60;
            let baseTemp = 24;

            if (block.cropType?.toLowerCase().includes('maize')) { baseMoisture = 55; }
            if (block.cropType?.toLowerCase().includes('rice')) { baseMoisture = 80; }
            if (block.cropType?.toLowerCase().includes('beans')) { baseMoisture = 45; }

            // Variance
            const moisture = baseMoisture + (Math.random() * 10 - 5);
            const temp = baseTemp + (Math.random() * 6 - 3);

            // Find existing sensors or default needed
            const sensor = await db.sensor.findFirst({ where: { blockId: block.id } });

            if (sensor) {
                const reading = await db.sensorReading.create({
                    data: {
                        sensorId: sensor.id,
                        blockId: block.id,
                        moisture: parseFloat(moisture.toFixed(1)),
                        temp: parseFloat(temp.toFixed(1)),
                        timestamp: new Date()
                    }
                });
                updates.push(reading);
            }
        }

        return NextResponse.json({ success: true, updates: updates.length });
    } catch (error) {
        console.error("Simulation failed:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
