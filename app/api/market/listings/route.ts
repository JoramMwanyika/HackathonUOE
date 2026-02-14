import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { title, description, price, quantity, location, imageUrl } = data;

        if (!title || !price || !location) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const listing = await db.marketListing.create({
            data: {
                title,
                description: description || "",
                price: parseFloat(price),
                quantity,
                location,
                imageUrl,
                sellerId: session.user.id
            }
        });

        return NextResponse.json(listing);
    } catch (error) {
        console.error("Create Listing Error:", error);
        return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const listings = await db.marketListing.findMany({
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            include: {
                seller: {
                    select: { name: true, email: true, image: true }
                }
            }
        });

        return NextResponse.json(listings);
    } catch (error) {
        console.error("Fetch Listings Error:", error);
        return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }
}
