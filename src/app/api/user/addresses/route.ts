import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/user/addresses - Get user's addresses
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const addresses = await sql`
      SELECT 
        id,
        address_type,
        label,
        full_name,
        phone,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country,
        is_default,
        is_active,
        created_at,
        updated_at
      FROM user_addresses
      WHERE user_id = ${user.userId} AND is_active = true
      ORDER BY is_default DESC, created_at DESC
    `;

    return NextResponse.json({
      addresses: addresses.map(addr => ({
        id: addr.id,
        addressType: addr.address_type,
        label: addr.label,
        fullName: addr.full_name,
        phone: addr.phone,
        addressLine1: addr.address_line_1,
        addressLine2: addr.address_line_2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postal_code,
        country: addr.country,
        isDefault: addr.is_default,
        isActive: addr.is_active,
        createdAt: addr.created_at,
        updatedAt: addr.updated_at
      })),
      message: 'Addresses fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/user/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any;

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

    // Create the address
    const [newAddress] = await sql`
      INSERT INTO user_addresses (
        user_id, address_type, label, full_name, phone,
        address_line_1, address_line_2, city, state, 
        postal_code, country, is_default
      )
      VALUES (
        ${user.userId}, ${addressType || 'home'}, ${label}, ${fullName}, ${phone || null},
        ${addressLine1}, ${addressLine2 || null}, ${city}, ${state},
        ${postalCode || null}, ${country || 'Myanmar'}, ${isDefault || false}
      )
      RETURNING *
    `;

    return NextResponse.json({
      address: {
        id: newAddress.id,
        addressType: newAddress.address_type,
        label: newAddress.label,
        fullName: newAddress.full_name,
        phone: newAddress.phone,
        addressLine1: newAddress.address_line_1,
        addressLine2: newAddress.address_line_2,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postal_code,
        country: newAddress.country,
        isDefault: newAddress.is_default,
        isActive: newAddress.is_active,
        createdAt: newAddress.created_at,
        updatedAt: newAddress.updated_at
      },
      message: 'Address created successfully'
    });

  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
