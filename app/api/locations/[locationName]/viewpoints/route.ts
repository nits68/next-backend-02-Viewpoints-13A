import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ locationName: string }> }) {
  
  // Megoldás két lekérdezéssel
  try {
    const { locationName } = await params;
    // 1. lekérdezés:
    const location = await prisma.location.findFirst({
        where: {locationName: locationName}
    });
    if (!location) {
        return NextResponse.json(
            { message: "Nincs ilyen nevű hegység az adatbázisban!"},
            { status: 404 }
        );
    }

    // 2. lekérdezés
    const viewpoints = await prisma.viewpoint.findMany({
        where: {location_id: location.id},
        omit: {id: true}
    });

    if (viewpoints.length === 0) {
        return NextResponse.json(
            {message: "Ebben a hegységben nem találtam kilátót!"},
            {status: 404})
    }

    return NextResponse.json(viewpoints);

  } catch (error) {
    return NextResponse.json(
        {message: error instanceof Error ? error.message : "Ismeretlen hiba!"},
        { status: 500},
    );
  }
}