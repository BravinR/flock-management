import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET a single supplier by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [supplier] = await db
      .select()
      .from(suppliersTable)
      .where(eq(suppliersTable.id, supplierId));

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

// PUT update a supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, contactPerson, phone, email, address, notes } = body;

    const updateData: any = { updatedAt: new Date() };

    if (name) updateData.name = name;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (notes !== undefined) updateData.notes = notes;

    const [updatedSupplier] = await db
      .update(suppliersTable)
      .set(updateData)
      .where(eq(suppliersTable.id, supplierId))
      .returning();

    if (!updatedSupplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSupplier, { status: 200 });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

// DELETE a supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [deletedSupplier] = await db
      .delete(suppliersTable)
      .where(eq(suppliersTable.id, supplierId))
      .returning();

    if (!deletedSupplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Supplier deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
