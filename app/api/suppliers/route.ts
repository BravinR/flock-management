import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET all suppliers
export async function GET() {
  try {
    const suppliers = await db
      .select()
      .from(suppliersTable)
      .orderBy(desc(suppliersTable.createdAt));

    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

// POST create a new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact_person, phone, email, address, notes } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      );
    }

    const [newSupplier] = await db
      .insert(suppliersTable)
      .values({
        name,
        contactPerson: contact_person,
        phone,
        email,
        address,
        notes,
      })
      .returning();

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
