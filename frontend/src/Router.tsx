import { Center, Loader } from '@mantine/core';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
   {
      path: '/',
      // The layout route is lazy-loaded via a route module
      lazy: async () => {
         const mod = await import('@/layouts/AppLayoutRoute');
         return { Component: mod.Component };
      },
      children: [
         {
            index: true,
            lazy: async () => {
               const mod = await import('@/pages/Notifications.page');
               return { Component: mod.Component };
            }
         },
         {
            path: 'login',
            lazy: async () => {
               const mod = await import('@/pages/Login.page');
               return { Component: mod.Component };
            }
         }
      ]
   }
]);

export function Router() {
   return (
      <RouterProvider
         router={router}
         fallbackElement={
            <Center h='50vh'>
               <Loader />
            </Center>
         }
      />
   );
}
