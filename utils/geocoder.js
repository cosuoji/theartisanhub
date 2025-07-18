import fetch from 'node-fetch';
import axios from 'axios';

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

export const geocodeAddress = async (locationName) => {
  const encoded = encodeURIComponent(`${locationName}, Lagos, Nigeria`);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encoded}&key=${OPENCAGE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON: [lng, lat]
      };
    }

    throw new Error('No coordinates found');
  } catch (err) {
    console.error('Geocode error:', err.message);
    return null; // fallback to [0, 0] if needed
  }
};



const geocodeNewAddress = async (address) => {
  if (!OPENCAGE_API_KEY) {
    throw new Error('Missing OPENCAGE_API_KEY in environment');
  }

  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: address,
        key: OPENCAGE_API_KEY,
        limit: 1,
      },
    });

    const data = response.data;

    if (data.results.length === 0) {
      throw new Error('No geocoding result found for this address');
    }

    const { lat, lng } = data.results[0].geometry;

    return { lat, lng };
  } catch (err) {
    console.error('Geocode error:', err.message);
    throw new Error('Geocoding failed');
  }
};

export default geocodeNewAddress;
