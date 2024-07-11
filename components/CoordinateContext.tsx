import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for the context
interface CoordinateContextType {
  coordinates: any | null;
  setCoordinates: React.Dispatch<React.SetStateAction<any | null>>;
}

// Create the context with default values
const CoordinateContext = createContext<CoordinateContextType>({
  coordinates: null,
  setCoordinates: () => {},
});

// Custom hook to use the context
export const useCoordinateContext = () => useContext(CoordinateContext);

interface CoordinateProviderProps {
  children: ReactNode;
}

// Provider component to wrap around parts of the app that need access to the coordinates
export const CoordinateProvider: React.FC<CoordinateProviderProps> = ({ children }) => {
  const [coordinates, setCoordinates] = useState<any | null>(null);

  return (
    <CoordinateContext.Provider value={{ coordinates, setCoordinates }}>
      {children}
    </CoordinateContext.Provider>
  );
};
