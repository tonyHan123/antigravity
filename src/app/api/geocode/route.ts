import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/geocode
 * Convert address to coordinates using Google Geocoding API
 */
export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json();

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
        console.log('[Geocode] Google API Key exists:', !!googleApiKey);
        console.log('[Geocode] Address:', address);

        if (!googleApiKey) {
            console.error('[Geocode] NEXT_PUBLIC_GOOGLE_MAPS_KEY is not set');
            return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
        }

        // Call Google Geocoding API
        const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleApiKey}&language=ko&region=kr`;
        console.log('[Geocode] Calling Google API...');

        const response = await fetch(apiUrl);
        console.log('[Geocode] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Geocode] Google API error:', response.status, errorText);
            return NextResponse.json({ error: 'Geocoding API failed', details: errorText }, { status: 500 });
        }

        const data = await response.json();
        console.log('[Geocode] Google API status:', data.status);

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            const location = result.geometry.location;

            return NextResponse.json({
                latitude: location.lat,
                longitude: location.lng,
                address: result.formatted_address,
                placeId: result.place_id
            });
        }

        if (data.status === 'ZERO_RESULTS') {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        console.error('[Geocode] Unexpected response:', data);
        return NextResponse.json({
            error: 'Geocoding failed',
            status: data.status,
            message: data.error_message
        }, { status: 500 });

    } catch (error: any) {
        console.error('[Geocode] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
