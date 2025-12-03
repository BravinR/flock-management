import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vaccineAdministrationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET a single vaccine administration by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const administrationId = parseInt(id);

    if (isNaN(administrationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [administration] = await db
      .select()
      .from(vaccineAdministrationsTable)
      .where(eq(vaccineAdministrationsTable.id, administrationId));

    if (!administration) {
      return NextResponse.json(
        { error: "Vaccine administration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(administration, { status: 200 });
  } catch (error) {
    console.error("Error fetching vaccine administration:", error);
    return NextResponse.json(
      { error: "Failed to fetch vaccine administration" },
      { status: 500 }
    );
  }
}

// PUT update a vaccine administration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const administrationId = parseInt(id);

    if (isNaN(administrationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      scheduleId,
      administrationDate,
      fullFlockVaccinated,
      headCountVaccinated,
      cost,
      currency,
      notes,
      administeredBy,
    } = body;

    const updateData: any = { updatedAt: new Date() };

    if (scheduleId) updateData.scheduleId = scheduleId;
    if (administrationDate)
      updateData.administrationDate = new Date(administrationDate);
    if (fullFlockVaccinated !== undefined)
      updateData.fullFlockVaccinated = fullFlockVaccinated;
    if (headCountVaccinated !== undefined)
      updateData.headCountVaccinated = headCountVaccinated;
    if (cost) updateData.cost = cost;
    if (currency) updateData.currency = currency;
    if (notes !== undefined) updateData.notes = notes;
    if (administeredBy) updateData.administeredBy = administeredBy;

    const [updatedAdministration] = await db
      .update(vaccineAdministrationsTable)
      .set(updateData)
      .where(eq(vaccineAdministrationsTable.id, administrationId))
      .returning();

    if (!updatedAdministration) {
      return NextResponse.json(
        { error: "Vaccine administration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAdministration, { status: 200 });
  } catch (error) {
    console.error("Error updating vaccine administration:", error);
    return NextResponse.json(
      { error: "Failed to update vaccine administration" },
      { status: 500 }
    );
  }
}

// DELETE a vaccine administration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const administrationId = parseInt(id);

    if (isNaN(administrationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [deletedAdministration] = await db
      .delete(vaccineAdministrationsTable)
      .where(eq(vaccineAdministrationsTable.id, administrationId))
      .returning();

    if (!deletedAdministration) {
      return NextResponse.json(
        { error: "Vaccine administration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Vaccine administration deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting vaccine administration:", error);
    return NextResponse.json(
      { error: "Failed to delete vaccine administration" },
      { status: 500 }
    );
  }
}
