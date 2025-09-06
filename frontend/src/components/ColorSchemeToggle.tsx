import { ComputerIcon, MoonIcon, SunIcon } from 'lucide-react';
import { Group, SegmentedControl, useMantineColorScheme } from '@mantine/core';

export function ColorSchemeToggle() {
   const { setColorScheme, colorScheme } = useMantineColorScheme();

   return (
      <SegmentedControl
         value={colorScheme ?? 'auto'}
         size='sm'
         data={[
            {
               label: (
                  <Group>
                     <SunIcon size={16} />
                  </Group>
               ),
               value: 'light'
            },
            {
               label: (
                  <Group>
                     <MoonIcon size={16} />
                  </Group>
               ),
               value: 'dark'
            },
            {
               label: (
                  <Group>
                     <ComputerIcon size={16} />
                  </Group>
               ),
               value: 'auto'
            }
         ]}
         onChange={value => setColorScheme(value as 'light' | 'dark' | 'auto')}
      />
   );
}
