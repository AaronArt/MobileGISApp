// components/types.ts

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
  
  export interface FeatureCollection {
    type: string;
    features: Place[];
  }
  