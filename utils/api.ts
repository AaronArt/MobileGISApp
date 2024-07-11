// utils/api.ts

// Function to fetch places from the server
export const fetchPlaces = async () => {
  const API_URL = 'http://193.196.36.78:8080/geoserver/MobileGIS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobileGIS:group_1_data&maxFeatures=50&outputformat=application/json';
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched data:', data);
    return data.features;
  } catch (error) {
    console.error('Error fetching places:', error);
    throw error;
  }
};
