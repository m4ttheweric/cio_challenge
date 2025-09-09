import { ModalsProvider } from '@mantine/modals';

import { AppContextProvider } from '@/AppContext';
import { ApiAvailabilityGate } from '@/components/ApiAvailabilityGate';
import { AppLayout } from './AppLayout';

// This component wraps the AppLayout with necessary context providers
// and other global components like modals and API availability checks.
export function AppLayoutWrapper() {
  return (
    <AppContextProvider>
      {/* Modals provider is here so it can access the AppContext */}
      <ModalsProvider
        modalProps={{ size: 'lg', centered: true, padding: 'lg' }}
      >
        <ApiAvailabilityGate />
        <AppLayout />
      </ModalsProvider>
    </AppContextProvider>
  );
}
