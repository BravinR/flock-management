import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vaccineAdministrationsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET all vaccine administrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");

    let query = db.select().from(vaccineAdministrationsTable);

    // Filter by scheduleId if provided
    if (scheduleId) {
      const id = parseInt(scheduleId);
      if (!isNaN(id)) {
        query = query.where(
          eq(vaccineAdministrationsTable.scheduleId, id)
        ) as any;
      }
    }

    const administrations = await query.orderBy(
      desc(vaccineAdministrationsTable.administrationDate)
    );

    return NextResponse.json(administrations, { status: 200 });
  } catch (error) {
    console.error("Error fetching vaccine administrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch vaccine administrations" },
      { status: 500 }
    );
  }
}

// POST create a new vaccine administration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      schedule_id,
      administration_date,
      full_flock_vaccinated,
      head_count_vaccinated,
      cost,
      currency,
      notes,
      administered_by,
      created_by,
    } = body;

    // Validate required fields
    if (!schedule_id || !administration_date || !cost || !administered_by) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newAdministration] = await db
      .insert(vaccineAdministrationsTable)
      .values({
        scheduleId: schedule_id,
        administrationDate: new Date(administration_date),
        fullFlockVaccinated: full_flock_vaccinated ?? true,
        headCountVaccinated: head_count_vaccinated,
        cost,
        currency: currency || "KES",
        notes,
        administeredBy: administered_by,
        createdBy: created_by,
      })
      .returning();

    return NextResponse.json(newAdministration, { status: 201 });
  } catch (error) {
    console.error("Error creating vaccine administration:", error);
    return NextResponse.json(
      { error: "Failed to create vaccine administration" },
      { status: 500 }
    );
  }
}
