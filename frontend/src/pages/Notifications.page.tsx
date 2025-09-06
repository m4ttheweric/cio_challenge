import { useNotifications } from '@/api/hooks';
import { HEADER_HEIGHT } from '@/layouts/AppLayout';
import { Alert, Center, rem, Stack } from '@mantine/core';
import { AlertCircleIcon, InfoIcon } from 'lucide-react';
import { Suspense, lazy, useMemo } from 'react';

const NotificationsTable = lazy(() =>
   import('@/components/NotificationsTable').then(m => ({
      default: m.NotificationsTable
   }))
);

export function NotificationsPage() {
   const { data, isFetching, isPending, isError, error } = useNotifications();

   const allTypesAreDisabled =
      data?.preferences.email === false &&
      data?.preferences.push === false &&
      data?.preferences.sms === false;

   const enabledTypes = useMemo(
      () =>
         Object.entries(data?.preferences ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k.toUpperCase()),
      [data?.preferences]
   );

   if (isError)
      return (
         <Center h='50vh'>
            <Alert icon={<AlertCircleIcon />} w='300' title='Error' color='red'>
               {error.message}
            </Alert>
         </Center>
      );

   if (allTypesAreDisabled) {
      return (
         <Center>
            <Alert title='Alert' my='3rem' icon={<InfoIcon />} maw={400}>
               You have all notification types disabled in your preferences.
               Please enable at least one type to see notifications.
            </Alert>
         </Center>
      );
   }

   const maxHeight = `calc(100vh - ${rem(HEADER_HEIGHT + 112)})`;

   return (
      <Stack pos='relative'>
         <Suspense fallback={null}>
            <NotificationsTable
               data={data?.notifications ?? []}
               maxHeight={maxHeight}
               isLoading={isPending || isFetching}
               enabledTypes={enabledTypes}
            />
         </Suspense>
      </Stack>
   );
}

// React Router lazy route module export
export function Component() {
   return <NotificationsPage />;
}
