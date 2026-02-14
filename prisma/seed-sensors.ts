
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Seeding sensor data...")

    // 1. Get all blocks
    const blocks = await prisma.block.findMany()

    if (blocks.length === 0) {
        console.log("No blocks found. Create some blocks first!")
        return
    }

    console.log(`Found ${blocks.length} blocks. Adding sensors and readings...`)

    for (const block of blocks) {
        // 2. Create Sensors (if not exist)
        // Soil Moisture
        const moistureSensor = await prisma.sensor.upsert({
            where: { id: `sensor-${block.id}-moisture` }, // Predictable ID for demo
            update: {},
            create: {
                id: `sensor-${block.id}-moisture`,
                name: `Soil Moisture - ${block.name}`,
                type: 'moisture',
                blockId: block.id,
                status: 'active'
            }
        })

        // Concatenated ID for temperature sensor to avoid changing schema constraint if unique name enforced (it's not, but good practice)
        // Using upsert to avoid duplicates
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
        })

        // 3. Add Readings
        // Simulate slightly different values per crop type
        let baseMoisture = 60;
        let baseTemp = 24;

        if (block.cropType?.toLowerCase().includes('maize')) { baseMoisture = 55; }
        if (block.cropType?.toLowerCase().includes('rice')) { baseMoisture = 80; }
        if (block.cropType?.toLowerCase().includes('beans')) { baseMoisture = 45; }

        // Add some random variance
        const moisture = baseMoisture + (Math.random() * 10 - 5);
        const temp = baseTemp + (Math.random() * 6 - 3);

        await prisma.sensorReading.create({
            data: {
                sensorId: moistureSensor.id,
                blockId: block.id,
                moisture: parseFloat(moisture.toFixed(1)),
                temp: parseFloat(temp.toFixed(1)), // Storing temp in same reading for simplicity if schema allows w/ multiple optional fields
                timestamp: new Date()
            }
        })
    }

    console.log("✅ Sensor data seeded successfully!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
