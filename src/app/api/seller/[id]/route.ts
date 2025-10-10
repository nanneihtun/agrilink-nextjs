import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sellerId } = await params;

    // Get seller information with complete profile data from all tables
    const sellerData = await sql`
      SELECT 
        u.id, u.name, u."userType" as type, u."accountType", u."createdAt" as "joinedDate",
        up.location, up."profileImage", up.phone, up.website,
        bd."business_name", bd."business_description", bd."business_hours", bd.specialties, bd.policies,
        us.facebook, us.instagram, us.telegram, us.whatsapp, us.tiktok,
        uv.verified, uv."phoneVerified", uv."verificationStatus",
        ur.rating, ur."totalReviews", ur."responseTime", ur."qualityCertifications", ur."farmingMethods"
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up."userId"
      LEFT JOIN business_details bd ON u.id = bd.user_id
      LEFT JOIN user_social us ON u.id = us."userId"
      LEFT JOIN user_verification uv ON u.id = uv."userId"
      LEFT JOIN user_ratings ur ON u.id = ur."userId"
      WHERE u.id = ${sellerId}
      LIMIT 1
    `;

    if (sellerData.length === 0) {
      return NextResponse.json(
        { message: "Seller not found" },
        { status: 404 }
      );
    }

    const seller = sellerData[0];

    // Transform the data to match the expected format with all available fields
    const transformedSeller = {
      id: seller.id,
      name: seller.name || 'Unknown Seller',
      type: seller.type || 'farmer',
      accountType: seller.accountType || 'individual',
      location: seller.location || 'Myanmar',
      description: seller.business_description || `Experienced ${seller.type || 'farmer'} located in ${seller.location || 'Myanmar'}.`,
      image: seller.profileImage || "/api/placeholder/400/300",
      rating: parseFloat(seller.rating) || 0,
      totalReviews: seller.totalReviews || 0,
      yearsActive: 1,
      responseTime: seller.responseTime || 'Within 24 hours',
      certifications: seller.qualityCertifications || [],
      joinedDate: seller.joinedDate,
      verified: seller.verified || false,
      phoneVerified: seller.phoneVerified || false,
      verificationStatus: seller.verificationStatus || 'not_started',
      // Additional fields for complete storefront data
      businessName: seller.business_name,
      businessDescription: seller.business_description,
      businessHours: seller.business_hours,
      specialties: seller.specialties || [],
      policies: seller.policies || {},
      phone: seller.phone,
      website: seller.website,
      socialMedia: {
        facebook: seller.facebook,
        instagram: seller.instagram,
        telegram: seller.telegram,
        whatsapp: seller.whatsapp,
        tiktok: seller.tiktok,
      },
      farmingMethods: seller.farmingMethods || [],
    };

    return NextResponse.json({
      seller: transformedSeller,
    });
  } catch (error) {
    console.error("Error fetching seller:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
