import { ShipIcon } from 'lucide-react';
import { Group, Title } from '@mantine/core';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle';

export const HeaderContent = () => (
   <Group mx='md' align='center' justify='space-between' h='100%'>
      <Group gap='xs'>
         <ShipIcon size={16} />
         <Title order={3} fw={500}>
            User Preferences
         </Title>
      </Group>
      <ColorSchemeToggle />
   </Group>
);
