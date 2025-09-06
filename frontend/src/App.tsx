import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //import MRT styles

import { queryClient } from '@/api/hooks';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { Router } from './Router';
import { theme } from './theme';

export default function App() {
   return (
      <MantineProvider theme={theme}>
         <QueryClientProvider client={queryClient}>
            <Notifications />
            <Router />
         </QueryClientProvider>
      </MantineProvider>
   );
}
