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
        "addressType",
        label,
        "fullName",
        phone,
        "addressLine1",
        "addressLine2",
        city,
        state,
        "postalCode",
        country,
        "isDefault",
        "isActive",
        "createdAt",
        "updatedAt"
      FROM user_addresses
      WHERE "userId" = ${user.userId} AND "isActive" = true
      ORDER BY "isDefault" DESC, "createdAt" DESC
    `;

    return NextResponse.json({
      addresses: addresses.map(addr => ({
        id: addr.id,
        addressType: addr.addressType,
        label: addr.label,
        fullName: addr.fullName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        isDefault: addr.isDefault,
        isActive: addr.isActive,
        createdAt: addr.createdAt,
        updatedAt: addr.updatedAt
      })),
      message: 'Addresses fetched successfully'
    });

  } catch (error: any) {
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
        "userId", "addressType", "label", "fullName", "phone",
        "addressLine1", "addressLine2", city, state, 
        "postalCode", country, "isDefault"
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
        addressType: newAddress.addressType,
        label: newAddress.label,
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        addressLine1: newAddress.addressLine1,
        addressLine2: newAddress.addressLine2,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        country: newAddress.country,
        isDefault: newAddress.isDefault,
        isActive: newAddress.isActive,
        createdAt: newAddress.createdAt,
        updatedAt: newAddress.updatedAt
      },
      message: 'Address created successfully'
    });

  } catch (error: any) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
