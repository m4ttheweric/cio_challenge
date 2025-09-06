import { useAppContext } from '@/AppContext';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle';
import { Preferences, PreferencesDataLoader } from '@/components/Preferences';
import { Button, Group, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';

import { LogOut, Settings } from 'lucide-react';
import { useCallback } from 'react';

const HeaderButton = Button.withProps({
   color: 'indigo',
   variant: 'light',
   size: 'compact-sm'
});

export const HeaderContent = () => {
   const { signOut, userEmail } = useAppContext();

   const handlePreferencesClick = useCallback(() => {
      modals.open({
         title: 'Notification Preferences',

         children: (
            <PreferencesDataLoader>
               {({ userPreferences, isLoading }) => (
                  <Preferences
                     userPreferences={userPreferences}
                     isLoading={isLoading}
                  />
               )}
            </PreferencesDataLoader>
         )
      });
   }, [modals]);

   return (
      <Group mx='md' align='center' justify='space-between' h='100%'>
         <Group gap='md'>
            <Title order={3} fw={500}>
               Notifications
            </Title>
            <ColorSchemeToggle />
         </Group>
         <Group>
            <Text size='sm' c='gray'>
               {userEmail}
            </Text>
            <HeaderButton
               leftSection={<Settings size={14} />}
               onClick={handlePreferencesClick}
            >
               Preferences
            </HeaderButton>
            <HeaderButton
               disabled={location.href.includes('/login')}
               rightSection={<LogOut size={12} />}
               onClick={signOut}
            >
               Sign Out
            </HeaderButton>
         </Group>
      </Group>
   );
};
