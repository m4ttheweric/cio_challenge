import { Center, Loader } from '@mantine/core';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    // The layout route is lazy-loaded via a route module
    lazy: async () => {
      const mod = await import('@/layouts/AppLayoutWrapper');
      return { Component: mod.AppLayoutWrapper };
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@/pages/Notifications.page');
          return { Component: mod.NotificationsPage };
        },
      },
      {
        path: 'login',
        lazy: async () => {
          const mod = await import('@/pages/Login.page');
          return { Component: mod.LoginPage };
        },
      },
    ],
  },
]);

export function Router() {
  return (
    <RouterProvider
      router={router}
      fallbackElement={
        <Center h="50vh">
          <Loader />
        </Center>
      }
    />
  );
}
