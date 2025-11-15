"""
Google Trends Service
Extrage trenuri relevante pentru business folosind pytrends.
"""
from pytrends.request import TrendReq
from typing import Dict, List, Any, Optional
import time
from datetime import datetime, timedelta


class TrendsService:
    """Service pentru extragerea și analiza Google Trends."""
    
    def __init__(self):
        """Inițializează conexiunea cu Google Trends."""
        self.pytrends = TrendReq(hl='en-US', tz=360)
        
    def get_business_trends(
        self, 
        business_type: str, 
        location: str = "US",
        timeframe: str = 'today 1-m'
    ) -> Dict[str, Any]:
        """
        Extrage trends pentru un tip de business.
        
        Args:
            business_type: Tipul de business (ex: "coffee shop", "restaurant")
            location: Locația (default: "US")
            timeframe: Perioada de analiză (default: ultima lună)
            
        Returns:
            Dict cu trends și insights
        """
        try:
            # Generează keywords relevante pentru business type
            keywords = self._generate_keywords(business_type)
            
            print(f"🔍 Searching Google Trends for: {keywords}")
            print(f"📍 Location: {location}")
            print(f"📅 Timeframe: {timeframe}")
            
            # Build payload pentru Google Trends
            self.pytrends.build_payload(
                keywords,
                cat=0,
                timeframe=timeframe,
                geo=location,
                gprop=''
            )
            
            # Extrage interest over time
            interest_over_time = self.pytrends.interest_over_time()
            
            # Extrage related queries
            related_queries = self.pytrends.related_queries()
            
            # Extrage trending searches
            try:
                trending = self.pytrends.trending_searches(pn='united_states')
                trending_list = trending[0].tolist()[:10]  # Top 10
            except Exception as e:
                print(f"Warning: Could not fetch trending searches: {e}")
                trending_list = []
            
            # Procesează datele
            trends_data = self._process_trends_data(
                interest_over_time,
                related_queries,
                trending_list,
                keywords
            )
            
            return {
                "success": True,
                "business_type": business_type,
                "location": location,
                "timeframe": timeframe,
                "keywords_analyzed": keywords,
                "trends": trends_data,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error fetching trends: {e}")
            return {
                "success": False,
                "error": str(e),
                "business_type": business_type
            }
    
    def _generate_keywords(self, business_type: str) -> List[str]:
        """
        Generează keywords relevante pentru business type.
        
        Args:
            business_type: Tipul de business
            
        Returns:
            Listă de keywords pentru search
        """
        # Mapare business types la keywords
        business_keywords_map = {
            "coffee": ["coffee shop", "cafe", "specialty coffee", "espresso"],
            "restaurant": ["restaurant", "dining", "food delivery", "takeout"],
            "retail": ["retail store", "shopping", "boutique"],
            "fitness": ["gym", "fitness", "workout", "yoga"],
            "beauty": ["salon", "spa", "beauty services"],
            "tech": ["tech services", "IT support", "software"],
            "bar": ["bar", "cocktails", "nightlife", "drinks"],
            "bakery": ["bakery", "pastry", "bread", "desserts"]
        }
        
        # Găsește keywords relevante
        business_lower = business_type.lower()
        for key, keywords in business_keywords_map.items():
            if key in business_lower:
                return keywords[:5]  # Max 5 keywords pentru API limits
        
        # Default: folosește business type-ul direct
        return [business_type, f"{business_type} near me"][:5]
    
    def _process_trends_data(
        self,
        interest_over_time,
        related_queries,
        trending_list: List[str],
        keywords: List[str]
    ) -> Dict[str, Any]:
        """
        Procesează și analizează datele de trends.
        
        Args:
            interest_over_time: DataFrame cu interest over time
            related_queries: Dict cu related queries
            trending_list: Lista de trending searches
            keywords: Keywords analizate
            
        Returns:
            Dict cu trends procesate
        """
        trends_summary = {
            "interest_trend": "stable",
            "average_interest": 0,
            "peak_interest": 0,
            "related_rising_queries": [],
            "related_top_queries": [],
            "trending_searches": trending_list,
            "keywords_performance": {}
        }
        
        # Analizează interest over time
        if not interest_over_time.empty:
            # Exclude coloana 'isPartial' dacă există
            numeric_cols = [col for col in interest_over_time.columns if col != 'isPartial']
            
            for keyword in numeric_cols:
                if keyword in interest_over_time.columns:
                    values = interest_over_time[keyword].values
                    avg_interest = float(values.mean())
                    peak_interest = float(values.max())
                    
                    # Calculează trend (ultimele valori vs primele valori)
                    if len(values) > 1:
                        recent_avg = values[-7:].mean()  # Ultima săptămână
                        older_avg = values[:7].mean()    # Prima săptămână
                        
                        if recent_avg > older_avg * 1.1:
                            trend = "rising"
                        elif recent_avg < older_avg * 0.9:
                            trend = "declining"
                        else:
                            trend = "stable"
                    else:
                        trend = "stable"
                    
                    trends_summary["keywords_performance"][keyword] = {
                        "average_interest": round(avg_interest, 2),
                        "peak_interest": int(peak_interest),
                        "trend": trend
                    }
            
            # Overall metrics
            all_values = interest_over_time[numeric_cols].values.flatten()
            trends_summary["average_interest"] = round(float(all_values.mean()), 2)
            trends_summary["peak_interest"] = int(all_values.max())
            
            # Determine overall trend
            recent_avg = all_values[-len(numeric_cols)*7:].mean()
            older_avg = all_values[:len(numeric_cols)*7].mean()
            
            if recent_avg > older_avg * 1.1:
                trends_summary["interest_trend"] = "rising"
            elif recent_avg < older_avg * 0.9:
                trends_summary["interest_trend"] = "declining"
        
        # Extrage related queries
        for keyword in keywords:
            if keyword in related_queries:
                # Rising queries
                if 'rising' in related_queries[keyword]:
                    rising = related_queries[keyword]['rising']
                    if rising is not None and not rising.empty:
                        rising_list = rising.head(5).to_dict('records')
                        trends_summary["related_rising_queries"].extend([
                            {
                                "query": item.get('query', ''),
                                "value": item.get('value', 0)
                            }
                            for item in rising_list
                        ])
                
                # Top queries
                if 'top' in related_queries[keyword]:
                    top = related_queries[keyword]['top']
                    if top is not None and not top.empty:
                        top_list = top.head(5).to_dict('records')
                        trends_summary["related_top_queries"].extend([
                            {
                                "query": item.get('query', ''),
                                "value": item.get('value', 0)
                            }
                            for item in top_list
                        ])
        
        return trends_summary


def analyze_business_trends(business_type: str, location: str = "US-NY") -> Dict[str, Any]:
    """
    Funcție helper pentru analiză trends.
    
    Args:
        business_type: Tipul de business
        location: Locația (ex: "US-NY" pentru New York)
        
    Returns:
        Dict cu rezultatele analizei
    """
    service = TrendsService()
    
    # Rate limiting pentru Google Trends API
    time.sleep(1)
    
    return service.get_business_trends(
        business_type=business_type,
        location=location,
        timeframe='today 1-m'
    )
