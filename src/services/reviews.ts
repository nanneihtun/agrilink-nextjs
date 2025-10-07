// Reviews service for seller statistics
// Note: This is a simplified version for Next.js + Neon setup

export interface SellerStats {
  totalProducts: number;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  responseTime: string;
  completionRate: number;
  recentReviews: any[];
}

export class ReviewsService {
  static async getSellerStats(sellerId: string): Promise<SellerStats> {
    console.log(`📊 Getting seller stats for ${sellerId}`);
    
    try {
      // Fetch seller stats from the API
      const response = await fetch(`/api/seller/${sellerId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.stats;
      } else {
        console.warn('Failed to fetch seller stats, using defaults');
      }
    } catch (error) {
      console.error('Error fetching seller stats:', error);
    }

    // Fallback to default values if API fails
    return {
      totalProducts: 0,
      totalSales: 0,
      averageRating: 0,
      totalReviews: 0,
      responseTime: 'Within 24 hours',
      completionRate: 100,
      recentReviews: []
    };
  }
}