import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

// PUT /api/user/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { id: addressId } = await params;

    const body = await request.json();
    const {
      addressType,
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = body;

    // Validate required fields
    if (!label || !fullName || !addressLine1 || !city || !state) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if address belongs to user
    const [existingAddress] = await sql`
      SELECT user_id FROM user_addresses 
      WHERE id = ${addressId} AND user_id = ${user.userId}
    `;

    if (!existingAddress) {
      return NextResponse.json(
        { message: 'Address not found or access denied' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      await sql`
        UPDATE user_addresses 
        SET is_default = false 
        WHERE user_id = ${user.userId} AND id != ${addressId}
      `;
    }

    // Update the address
    const [updatedAddress] = await sql`
      UPDATE user_addresses SET
        address_type = ${addressType || 'home'},
        label = ${label},
        full_name = ${fullName},
        phone = ${phone || null},
        address_line_1 = ${addressLine1},
        address_line_2 = ${addressLine2 || null},
        city = ${city},
        state = ${state},
        postal_code = ${postalCode || null},
        country = ${country || 'Myanmar'},
        is_default = ${isDefault || false},
        updated_at = NOW()
      WHERE id = ${addressId} AND user_id = ${user.userId}
      RETURNING *
    `;

    return NextResponse.json({
      address: {
        id: updatedAddress.id,
        addressType: updatedAddress.address_type,
        label: updatedAddress.label,
        fullName: updatedAddress.full_name,
        phone: updatedAddress.phone,
        addressLine1: updatedAddress.address_line_1,
        addressLine2: updatedAddress.address_line_2,
        city: updatedAddress.city,
        state: updatedAddress.state,
        postalCode: updatedAddress.postal_code,
        country: updatedAddress.country,
        isDefault: updatedAddress.is_default,
        isActive: updatedAddress.is_active,
        createdAt: updatedAddress.created_at,
        updatedAt: updatedAddress.updated_at
      },
      message: 'Address updated successfully'
    });

  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { id: addressId } = await params;

    // Check if address belongs to user
    const [existingAddress] = await sql`
      SELECT user_id, is_default FROM user_addresses 
      WHERE id = ${addressId} AND user_id = ${user.userId}
    `;

    if (!existingAddress) {
      return NextResponse.json(
        { message: 'Address not found or access denied' },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    await sql`
      UPDATE user_addresses 
      SET is_active = false, updated_at = NOW()
      WHERE id = ${addressId} AND user_id = ${user.userId}
    `;

    return NextResponse.json({
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
