import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await sql`SELECT 1 as test`;
    console.log('Database connection successful:', result);
    
    // Test if products table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      ) as table_exists
    `;
    console.log('Products table exists:', tableCheck[0]?.table_exists);
    
    // Test products count
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    console.log('Product count:', productCount[0]?.count);
    
    return NextResponse.json({
      success: true,
      database_connected: true,
      products_table_exists: tableCheck[0]?.table_exists,
      product_count: productCount[0]?.count,
      message: 'Database test successful'
    });

  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
