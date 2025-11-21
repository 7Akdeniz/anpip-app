/**
 * IP-basierte Geolocation API
 * 
 * Ermittelt grobe Standort-Informationen basierend auf IP-Adresse
 * Nutzt ipapi.co (kostenlos, 1000 Requests/Tag)
 * 
 * GET /api/location/ip
 */

export async function GET(request: Request) {
  try {
    // Hole IP-Adresse aus Request-Header
    const ip = 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    console.log('🌐 IP-basierte Location für:', ip);

    // ipapi.co bietet kostenlosen Service (1000 requests/day)
    // Alternative: ip-api.com (ebenfalls kostenlos)
    let locationData;

    try {
      // Primär: ipapi.co
      const response = await fetch(`https://ipapi.co/json/`, {
        headers: {
          'User-Agent': 'Anpip.com App',
        },
      });

      if (response.ok) {
        locationData = await response.json();
      } else {
        throw new Error('ipapi.co fehlgeschlagen');
      }
    } catch (error) {
      console.log('⚠️ ipapi.co fehlgeschlagen, versuche ip-api.com...');
      
      // Fallback: ip-api.com
      const fallbackResponse = await fetch(`http://ip-api.com/json/`, {
        headers: {
          'User-Agent': 'Anpip.com App',
        },
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        
        // Konvertiere ip-api.com Format zu unserem Format
        locationData = {
          city: fallbackData.city,
          country_name: fallbackData.country,
          latitude: fallbackData.lat,
          longitude: fallbackData.lon,
          postal: fallbackData.zip,
        };
      } else {
        throw new Error('Beide IP-Location-Services fehlgeschlagen');
      }
    }

    // Validiere Daten
    if (!locationData || !locationData.city || !locationData.country_name) {
      return Response.json(
        { 
          error: 'Standort konnte nicht ermittelt werden',
          ip,
        },
        { status: 404 }
      );
    }

    const city = locationData.city;
    const country = locationData.country_name;
    const lat = locationData.latitude || 0;
    const lon = locationData.longitude || 0;
    const postcode = locationData.postal || '';

    return Response.json({
      lat,
      lon,
      city,
      country,
      displayName: `${city}, ${country}`,
      postcode,
      source: 'ip',
      ip: ip !== 'unknown' ? ip : undefined,
    });

  } catch (error: any) {
    console.error('IP-basierte Geolocation Fehler:', error);
    return Response.json(
      { 
        error: error.message || 'Interner Server-Fehler',
        fallback: {
          city: 'Berlin',
          country: 'Deutschland',
          lat: 52.52,
          lon: 13.405,
          displayName: 'Berlin, Deutschland',
          source: 'default',
        },
      },
      { status: 200 } // Trotz Fehler 200 zurückgeben mit Fallback
    );
  }
}
