/**
 * API Route: Location Search via OpenStreetMap Nominatim
 * 
 * Proxy endpoint to search cities worldwide using Nominatim API
 * This keeps API traffic on server-side and allows rate limiting
 */

// Nominatim API configuration
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'anpip.com/1.0';
const REQUEST_TIMEOUT = 5000; // 5 seconds

// Rate limiting: simple in-memory cache
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

export interface NominatimLocation {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    postcode?: string;
  };
}

export interface CleanLocation {
  id: number;
  city: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
  postcode?: string;
}

/**
 * Clean and normalize Nominatim response
 */
function cleanLocation(location: NominatimLocation): CleanLocation | null {
  const address = location.address;
  if (!address) return null;

  // Extract city name (can be in different fields)
  const city = address.city || address.town || address.village;
  if (!city || !address.country) return null;

  return {
    id: location.place_id,
    city,
    country: address.country,
    lat: parseFloat(location.lat),
    lon: parseFloat(location.lon),
    displayName: location.display_name,
    postcode: address.postcode,
  };
}

/**
 * Search locations via Nominatim API
 */
async function searchLocations(query: string): Promise<CleanLocation[]> {
  // Rate limiting check
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();

  // Build Nominatim URL
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '10',
  });

  const url = `${NOMINATIM_BASE_URL}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data: NominatimLocation[] = await response.json();
    
    // Clean and filter results
    const cleanedLocations = data
      .map(cleanLocation)
      .filter((loc): loc is CleanLocation => loc !== null);

    return cleanedLocations;
  } catch (error) {
    console.error('Nominatim API error:', error);
    throw error;
  }
}

/**
 * POST handler for Expo Router API
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { q: query } = body;

    // Validation
    if (!query || typeof query !== 'string') {
      return Response.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    if (query.length < 2) {
      return Response.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return Response.json(
        { error: 'Query is too long' },
        { status: 400 }
      );
    }

    // Search locations
    const locations = await searchLocations(query);

    return Response.json({
      success: true,
      count: locations.length,
      data: locations,
    });

  } catch (error: any) {
    console.error('Location search error:', error);
    
    return Response.json(
      { 
        success: false,
        error: 'Failed to search locations',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for Expo Router API  
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return Response.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const locations = await searchLocations(query);

    return Response.json({
      success: true,
      count: locations.length,
      data: locations,
    });

  } catch (error: any) {
    console.error('Location search error:', error);
    
    return Response.json(
      { 
        success: false,
        error: 'Failed to search locations',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
