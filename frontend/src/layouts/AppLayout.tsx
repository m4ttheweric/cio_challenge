import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';

import { HeaderContent } from '@/components/HeaderContent';

export const HEADER_HEIGHT = 45;

// The main application layout with a header and an outlet for nested routes.
export function AppLayout() {
  return (
    <AppShell header={{ height: HEADER_HEIGHT }} padding="md">
      <AppShell.Header>
        <HeaderContent />
      </AppShell.Header>
      <AppShell.Main px={0} pb={0} pt={HEADER_HEIGHT}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
