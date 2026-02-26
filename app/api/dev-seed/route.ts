import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        console.log("🌱 Seeding sensor data...");

        const blocks = await prisma.block.findMany();

        if (blocks.length === 0) {
            return NextResponse.json({ message: "No blocks found. Create some blocks first!" });
        }

        console.log(`Found ${blocks.length} blocks. Adding sensors and readings...`);

        let count = 0;
        for (const block of blocks) {
            const moistureSensor = await prisma.sensor.upsert({
                where: { id: `sensor-${block.id}-moisture` },
                update: {},
                create: {
                    id: `sensor-${block.id}-moisture`,
                    name: `Soil Moisture - ${block.name}`,
                    type: 'moisture',
                    blockId: block.id,
                    status: 'active'
                }
            });

            const tempSensor = await prisma.sensor.upsert({
                where: { id: `sensor-${block.id}-temp` },
                update: {},
                create: {
                    id: `sensor-${block.id}-temp`,
                    name: `Temperature - ${block.name}`,
                    type: 'temperature',
                    blockId: block.id,
                    status: 'active'
                }
            });

            let baseMoisture = 60;
            let baseTemp = 24;

            if (block.cropType?.toLowerCase().includes('maize')) { baseMoisture = 55; }
            if (block.cropType?.toLowerCase().includes('rice')) { baseMoisture = 80; }
            if (block.cropType?.toLowerCase().includes('beans')) { baseMoisture = 45; }

            const moisture = baseMoisture + (Math.random() * 10 - 5);
            const temp = baseTemp + (Math.random() * 6 - 3);

            await prisma.sensorReading.create({
                data: {
                    sensorId: moistureSensor.id,
                    blockId: block.id,
                    moisture: parseFloat(moisture.toFixed(1)),
                    temp: parseFloat(temp.toFixed(1)),
                    timestamp: new Date()
                }
            });
            count++;
        }

        return NextResponse.json({ message: `✅ Successfully seeded sensor data for ${count} blocks!` });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
