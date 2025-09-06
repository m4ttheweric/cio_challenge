import { AppContextProvider } from '@/AppContext';
import { ModalsProvider } from '@mantine/modals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/Login.page';
import { NotificationsPage } from './pages/Notifications.page';

const router = createBrowserRouter([
   {
      path: '/',
      element: (
         <AppContextProvider>
            <ModalsProvider
               modalProps={{ size: 'lg', centered: true, padding: 'lg' }}
            >
               <AppLayout />
            </ModalsProvider>
         </AppContextProvider>
      ),
      children: [
         {
            index: true,
            element: <NotificationsPage />
         },
         { path: 'login', element: <LoginPage /> }
      ]
   }
]);

export function Router() {
   return <RouterProvider router={router} />;
}
