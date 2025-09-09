import { AppContextProvider } from '@/AppContext';
import { ModalsProvider } from '@mantine/modals';
import { AppLayout } from './AppLayout';
import { ApiAvailabilityGate } from '@/components/ApiAvailabilityGate';

export function Component() {
   return (
      <AppContextProvider>
         <ModalsProvider
            modalProps={{ size: 'lg', centered: true, padding: 'lg' }}
         >
            <ApiAvailabilityGate />
            <AppLayout />
         </ModalsProvider>
      </AppContextProvider>
   );
}
