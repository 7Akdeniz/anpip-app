/**
 * Reverse Geocoding API
 * 
 * Konvertiert GPS-Koordinaten (lat/lon) in Stadt/Land
 * Nutzt OpenStreetMap Nominatim API
 * 
 * GET /api/location/reverse?lat=52.52&lon=13.40
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return Response.json(
        { error: 'Parameter lat und lon erforderlich' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return Response.json(
        { error: 'Ungültige Koordinaten' },
        { status: 400 }
      );
    }

    // Validiere Koordinaten-Bereich
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return Response.json(
        { error: 'Koordinaten außerhalb gültigen Bereichs' },
        { status: 400 }
      );
    }

    // Rufe Nominatim API auf
    const nominatimUrl = 
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${latitude}&` +
      `lon=${longitude}&` +
      `format=json&` +
      `addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Anpip.com App',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API Fehler: ${response.status}`);
    }

    const data = await response.json();

    // Extrahiere relevante Informationen
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.village || 
                 data.address?.municipality || 
                 data.address?.hamlet || 
                 '';

    const country = data.address?.country || '';
    const displayName = data.display_name || '';
    const postcode = data.address?.postcode || '';

    if (!city || !country) {
      return Response.json(
        { error: 'Keine Stadt für diese Koordinaten gefunden' },
        { status: 404 }
      );
    }

    return Response.json({
      lat: latitude,
      lon: longitude,
      city,
      country,
      displayName,
      postcode,
      source: 'nominatim',
    });

  } catch (error: any) {
    console.error('Reverse Geocoding Fehler:', error);
    return Response.json(
      { error: error.message || 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}
