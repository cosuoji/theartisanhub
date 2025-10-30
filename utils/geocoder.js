import fetch from 'node-fetch';
import axios from 'axios';
import dotenv from "dotenv"

dotenv.config()

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

export const geocodeAddress = async (locationName) => {
  const encoded = encodeURIComponent(`${locationName}, Lagos, Nigeria`);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encoded}&key=${OPENCAGE_API_KEY}`;
  console.log('OpenCage Key:', process.env.OPENCAGE_API_KEY);


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
  }  catch (err) {
  if (err.response) {
    console.error('Geocode error:', err.response.data);
  } else {
    console.error('Geocode error:', err.message);
  }
  throw new Error('Geocoding failed');
}
};



const geocodeNewAddress = async (address) => {
  if (!OPENCAGE_API_KEY) {
    throw new Error('Missing OPENCAGE_API_KEY in environment');
  }

  try {
    // ✅ Append default city/country if not included
    let fullAddress = address;
    if (!/lagos/i.test(address)) {
      fullAddress = `${address}, Lagos, Nigeria`;
    }

    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: fullAddress,
        key: OPENCAGE_API_KEY,
        limit: 1,
      },
    });

    const data = response.data;

    if (!data.results || data.results.length === 0) {
      console.error('No geocoding result found for:', fullAddress);
      throw new Error('No geocoding result found for this address');
    }

    const { lat, lng } = data.results[0].geometry;
    return { lat, lng };

  } catch (err) {
    if (err.response) {
      console.error('Geocode error:', err.response.data);
    } else {
      console.error('Geocode error:', err.message);
    }
    throw new Error('Geocoding failed');
  }
};

export default geocodeNewAddress;
