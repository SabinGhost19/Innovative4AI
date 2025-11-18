/**
 * Data Service - Centralizează toate API calls către backend
 */

import type { 
  SurvivalData, 
  CountySurvivalStats, 
  CensusData, 
  DetailedCensusData,
  GoogleTrendsData 
} from '../types';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export class DataService {
  private backendUrl: string;
  
  constructor(backendUrl?: string) {
    this.backendUrl = backendUrl || BACKEND_URL;
  }
  
  // ============================================
  // BUSINESS SURVIVAL DATA
  // ============================================
  
  /**
   * Get survival rate pentru un tip specific de business
   */
  async getSurvivalDataForBusiness(
    businessType: string, 
    county: string
  ): Promise<SurvivalData | null> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/survival/business-type/${encodeURIComponent(county)}?business_type=${encodeURIComponent(businessType)}`
      );
      
      if (!response.ok) {
        console.warn(`No survival data found for ${businessType} in ${county}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch survival data:', error);
      return null;
    }
  }
  
  /**
   * Get statistici complete pentru un county
   */
  async getCountySurvivalStats(county: string): Promise<CountySurvivalStats | null> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/survival/county/${encodeURIComponent(county)}/statistics`
      );
      
      if (!response.ok) {
        console.warn(`No survival stats found for ${county}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch county stats:', error);
      return null;
    }
  }
  
  /**
   * Get industrii cu survival rate cel mai mare (safest bets)
   */
  async getHighestSurvivalIndustries(
    county: string, 
    limit: number = 5
  ): Promise<Array<any>> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/survival/county/${encodeURIComponent(county)}/highest?limit=${limit}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.safest_industries || [];
    } catch (error) {
      console.error('Failed to fetch highest survival industries:', error);
      return [];
    }
  }
  
  /**
   * Get industrii cu survival rate cel mai mic (riskiest)
   */
  async getLowestSurvivalIndustries(
    county: string, 
    limit: number = 5
  ): Promise<Array<any>> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/survival/county/${encodeURIComponent(county)}/lowest?limit=${limit}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.riskiest_industries || [];
    } catch (error) {
      console.error('Failed to fetch lowest survival industries:', error);
      return [];
    }
  }
  
  // ============================================
  // CENSUS DATA
  // ============================================
  
  /**
   * Get Census data pentru o locație (folosit deja în launch-business)
   */
  async getCensusData(lat: number, lng: number): Promise<CensusData | null> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/census/geocode?lat=${lat}&lng=${lng}`
      );
      
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch census data:', error);
      return null;
    }
  }
  
  /**
   * Get detailed Census data
   */
  async getDetailedCensusData(lat: number, lng: number): Promise<DetailedCensusData | null> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/census/detailed?lat=${lat}&lng=${lng}`
      );
      
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch detailed census data:', error);
      return null;
    }
  }
  
  // ============================================
  // GOOGLE TRENDS DATA
  // ============================================
  
  /**
   * Get Google Trends data pentru business type
   */
  async getGoogleTrendsData(
    businessType: string, 
    location: string = 'US-NY'
  ): Promise<GoogleTrendsData | null> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/trends`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_type: businessType,
            location: location
          })
        }
      );
      
      if (!response.ok) {
        console.warn(`Failed to fetch trends data for ${businessType}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch trends data:', error);
      return null;
    }
  }
  
  // ============================================
  // UTILITY METHODS
  // ============================================
  
  /**
   * Check if backend is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
  
  /**
   * Fetch toate datele necesare pentru simulare într-un singur call paralel
   */
  async fetchAllSimulationData(
    businessType: string,
    lat: number,
    lng: number,
    county: string
  ): Promise<{
    censusData: CensusData | null;
    detailedCensusData: DetailedCensusData | null;
    survivalData: SurvivalData | null;
    countyStats: CountySurvivalStats | null;
    trendsData: GoogleTrendsData | null;
  }> {
    const [censusData, detailedCensusData, survivalData, countyStats, trendsData] = await Promise.all([
      this.getCensusData(lat, lng),
      this.getDetailedCensusData(lat, lng),
      this.getSurvivalDataForBusiness(businessType, county),
      this.getCountySurvivalStats(county),
      this.getGoogleTrendsData(businessType),
    ]);
    
    return {
      censusData,
      detailedCensusData,
      survivalData,
      countyStats,
      trendsData,
    };
  }
}

// Singleton instance
export const dataService = new DataService();
