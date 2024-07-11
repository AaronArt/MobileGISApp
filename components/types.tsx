// components/types.ts

// Define the structure of a Place object
export interface Place {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    name: string;
  };
}

// Define the structure of a FeatureCollection object
export interface FeatureCollection {
  type: string;
  features: Place[];
}
