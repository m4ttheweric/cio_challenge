import { useLocalStorage } from '@mantine/hooks';
import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AppContext = React.createContext<
   | {
        authToken: string | null;
        userEmail: string | null;
        setUserEmail: (email: string | null) => void;
        setAuthToken: (token: string | null) => void;
        signOut: () => void;
     }
   | undefined
>({
   authToken: null,
   userEmail: null,
   setUserEmail: () => {},
   setAuthToken: () => {},
   signOut: () => {}
});

export function AppContextProvider({
   children
}: {
   children: React.ReactNode;
}) {
   const [authToken, setAuthToken] = useLocalStorage<string | null>({
      key: 'authToken',
      defaultValue: null,
      getInitialValueInEffect: false
   });

   const [userEmail, setUserEmail] = useLocalStorage<string | null>({
      key: 'userEmail',
      defaultValue: null,
      getInitialValueInEffect: false
   });

   const navigate = useNavigate();

   const signOut = useCallback(() => {
      setAuthToken(null);
      setUserEmail(null);
   }, [setAuthToken]);

   useEffect(() => {
      if (!authToken) {
         navigate('/login');
      }
   }, [authToken]);

   return (
      <AppContext.Provider
         value={{ authToken, setAuthToken, signOut, userEmail, setUserEmail }}
      >
         {children}
      </AppContext.Provider>
   );
}

export function useAppContext() {
   const context = React.useContext(AppContext);
   if (context === undefined) {
      throw new Error(
         'useAppContext must be used within an AppContextProvider'
      );
   }
   return context;
}
