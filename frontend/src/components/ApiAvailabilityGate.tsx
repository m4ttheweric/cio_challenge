import { useHealth } from '@/api/hooks';
import { Alert, Group, Loader, Modal, Stack, Text } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useInterval } from '@mantine/hooks';

export function ApiAvailabilityGate() {
   const { data, isError, refetch } = useHealth();

   const unhealthy = useMemo(
      () => isError || data?.status !== 'ok',
      [isError, data?.status]
   );

   // Single interval: 3s when unhealthy, 30s when healthy
   const pollMs = unhealthy ? 3_000 : 30_000;
   const interval = useInterval(() => {
      refetch();
   }, pollMs);

   useEffect(() => {
      // restart interval with the new delay
      interval.stop();
      interval.start();
      return interval.stop;
   }, [pollMs]);

   return (
      <Modal
         opened={unhealthy}
         onClose={() => {}}
         withCloseButton={false}
         centered
      >
         <Alert title='API Error' color='red' icon={<AlertCircle size={16} />}>
            <Stack>
               We’re having trouble connecting to the API.
               <Group>
                  <Text size='xs' c='gray'>
                     Waiting for API...
                  </Text>
                  <Loader color='gray' type='bars' size={12} />
               </Group>
            </Stack>
         </Alert>
      </Modal>
   );
}
