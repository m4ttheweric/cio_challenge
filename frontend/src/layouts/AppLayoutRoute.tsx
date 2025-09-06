import { AppContextProvider } from '@/AppContext';
import { ModalsProvider } from '@mantine/modals';
import { AppLayout } from './AppLayout';

export function Component() {
   return (
      <AppContextProvider>
         <ModalsProvider
            modalProps={{ size: 'lg', centered: true, padding: 'lg' }}
         >
            <AppLayout />
         </ModalsProvider>
      </AppContextProvider>
   );
}
