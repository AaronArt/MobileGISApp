import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CoordinateContextType {
  coordinates: any | null;
  setCoordinates: React.Dispatch<React.SetStateAction<any | null>>;
}

const CoordinateContext = createContext<CoordinateContextType>({
  coordinates: null,
  setCoordinates: () => {},
});

export const useCoordinateContext = () => useContext(CoordinateContext);

interface CoordinateProviderProps {
  children: ReactNode;
}

export const CoordinateProvider: React.FC<CoordinateProviderProps> = ({ children }) => {
  const [coordinates, setCoordinates] = useState<any | null>(null);

  return (
    <CoordinateContext.Provider value={{ coordinates, setCoordinates }}>
      {children}
    </CoordinateContext.Provider>
  );
};
