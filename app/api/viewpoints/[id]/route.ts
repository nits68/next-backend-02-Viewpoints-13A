import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export type ViewpointItems = {
  viewpointName?: string;
  mountain?: string;
  location_id?: number;
  height?: number;
  description?: string;
  built?: string;
  imageUrl?: string;
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Létezik a megadott id-vel kilátó?
    const existingViewpoint = await prisma.viewpoint.findUnique({
      where: { id: Number(id) },
    });

    if (!existingViewpoint) {
      return NextResponse.json({ message: `${id} azonosítóval nem létezik kilátó!` }, {});
    }

    const changedData: ViewpointItems = await request.json();

    // Egyedi ellenőrzések: magasság >= 1, built dátum nem mutathat a jövőbe
    // 4.b feladat:
    if (changedData.built) {
      const newDate = new Date(changedData.built);
      if (newDate > new Date()) {
        return NextResponse.json(
          { message: "Az aktuális dátumnál nem adahat meg későbbi dátumot a built mezőben!" },
          { status: 400 },
        );
      }
    }

    // 4.c kilátó magassága
    if (changedData.height !== undefined && changedData.height < 1) {
      return NextResponse.json(
        { message: "A kilátónak legalább 1m magasnak kell lennie!" },
        { status: 400 },
      );
    }

    // Nem volt feladat: Új location_id létezik-e a kapcsolódó táblában?
    if (changedData.location_id !== undefined) {
      const locationIdExist = await prisma.location.findUnique({
        where: { id: changedData.location_id },
      });
      if (!locationIdExist) {
        return NextResponse.json(
          { message: "Nem létező kulcs a location_id mezőben!" },
          { status: 400 },
        );
      }
    }
    // Nem volt feladat - Vége

    const updatedDoc = await prisma.viewpoint.update({
      where: { id: Number(id) },
      data: changedData,
    });

    return NextResponse.json(updatedDoc, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Ismeretlen hiba!" },
      { status: 500 },
    );
  }
}
