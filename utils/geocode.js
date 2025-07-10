import axios from 'axios';

export const geocodeLocation = async (location) => {
  const encodedLocation = encodeURIComponent(location);

  // 1. Try Google Maps
  try {
    const googleApi = process.env.GOOGLE_GEOCODING_API_KEY;
    const googleRes = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${googleApi}`,
      { timeout: 5000 }
    );

    const coords = googleRes.data.results?.[0]?.geometry?.location;
    if (coords) return [coords.lng, coords.lat];
  } catch (err) {
    console.warn('[Geocode] Google failed:', err.message || err);
  }

  // 2. Fallback: OpenCage
  try {
    const openCageKey = process.env.OPENCAGE_API_KEY;
    const openCageRes = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodedLocation}&key=${openCageKey}`,
      { timeout: 5000 }
    );

    const coords = openCageRes.data.results?.[0]?.geometry;
    if (coords) return [coords.lng, coords.lat];
  } catch (err) {
    console.warn('[Geocode] OpenCage failed:', err.message || err);
  }

  // 3. Final fallback
  return null;
};
