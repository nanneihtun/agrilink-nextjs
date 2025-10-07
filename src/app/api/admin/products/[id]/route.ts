import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin
    if (decoded.email !== 'admin@agrilink.com') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { isActive } = body;

    // Update product status
    await sql`
      UPDATE products 
      SET 
        "isActive" = ${isActive},
        "updatedAt" = NOW()
      WHERE id = ${productId}
    `;

    return NextResponse.json({ 
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully` 
    });

  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
