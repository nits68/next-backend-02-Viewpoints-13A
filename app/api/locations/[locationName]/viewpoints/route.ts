import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationName: string }> },
) {
  // 1. Megoldás két lekérdezéssel
  try {
    const { locationName } = await params;
    // 1. lekérdezés:
    const location = await prisma.location.findFirst({
      where: { locationName: locationName },
    });
    if (!location) {
      return NextResponse.json(
        { message: "Nincs ilyen nevű hegység az adatbázisban!" },
        { status: 404 },
      );
    }

    // 2. lekérdezés
    const viewpoints = await prisma.viewpoint.findMany({
      where: { location_id: location.id },
      omit: { id: true },
    });

    if (viewpoints.length === 0) {
      return NextResponse.json(
        { message: "Ebben a hegységben nem találtam kilátót!" },
        { status: 404 },
      );
    }

    return NextResponse.json(viewpoints);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Ismeretlen hiba!" },
      { status: 500 },
    );
  }
}

// export async function GET(request: NextRequest, { params }: { params: Promise<{ locationName: string }> }) {

//   // 2. Megoldás "1"-oldali lekérdezéssel
//   try {
//     const {locationName} = await params;

//     const data = await prisma.location.findFirst({
//       where: {
//         locationName: locationName
//       },
//       select: {
//         viewpoints: {
//           omit: { id: true}
//         }
//       }
//     });

//     if (!data) {
//       return NextResponse.json(
//         { message: "Ez a hegység nem létezik!"},
//         { status: 404 },
//       );
//     }

//     if (data.viewpoints.length === 0) {
//       return NextResponse.json(
//         { message: "Ebben a hegységben nincs kilátó!"},
//         { status: 404 },
//       );
//     }

//     return NextResponse.json(data?.viewpoints);

//   } catch (error) {
//     return NextResponse.json(
//         {message: error instanceof Error ? error.message : "Ismeretlen hiba!"},
//         { status: 500},
//     );
//   }
// }

// export async function GET(request: NextRequest, { params }: { params: Promise<{ locationName: string }> }) {

//   // 3. Megoldás "N"-oldali lekérdezéssel
//   try {
//     const {locationName} = await params;

//     const data = await prisma.viewpoint.findMany({
//       where: {location: {locationName: locationName}},
//       omit: {id: true}
//     });

//     if (data.length === 0) {
//       return NextResponse.json(
//         { message: "Ez a hegység nem létezik, vagy  a hegységben nincs kilátó!"},
//         { status: 404 },
//       );
//     }

//     return NextResponse.json(data);

//   } catch (error) {
//     return NextResponse.json(
//         {message: error instanceof Error ? error.message : "Ismeretlen hiba!"},
//         { status: 500},
//     );
//   }
// }
