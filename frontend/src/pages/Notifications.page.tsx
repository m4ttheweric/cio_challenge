import { lazy, Suspense, useMemo } from 'react';
import { Alert, Center, Loader, rem, Stack } from '@mantine/core';
import { AlertCircleIcon, InfoIcon } from 'lucide-react';

import { useNotifications } from '@/api/hooks';
import { GetNotificationsResponse } from '@/api/types';
import { HEADER_HEIGHT } from '@/layouts/AppLayout';

const NotificationsTable = lazy(() =>
  import('@/components/NotificationsTable').then(m => ({
    default: m.NotificationsTable,
  }))
);

function allTypesAreDisabled(data: GetNotificationsResponse | undefined) {
  // If data is undefined (e.g., still loading), we don't want to say all types are disabled.
  if (!data) return false;

  return (
    data.preferences.email === false &&
    data.preferences.push === false &&
    data.preferences.sms === false
  );
}

const notificationTypes = ['email', 'push', 'sms'] as const;

export function NotificationsPage() {
  const { data, isFetching, isPending, isError, error } = useNotifications();

  const enabledTypes = useMemo(
    () => notificationTypes.filter(type => data?.preferences[type]),
    [data?.preferences]
  );

  if (isError)
    return (
      <Center h="50vh">
        <Alert icon={<AlertCircleIcon />} w="300" title="Error" color="red">
          {error.message}
        </Alert>
      </Center>
    );

  if (allTypesAreDisabled(data)) {
    return (
      <Center>
        <Alert title="Alert" my="3rem" icon={<InfoIcon />} maw={400}>
          You have all notification types disabled in your preferences. Please
          enable at least one type to see notifications.
        </Alert>
      </Center>
    );
  }

  const maxHeight = `calc(100vh - ${rem(HEADER_HEIGHT + 112)})`;

  return (
    <Stack pos="relative">
      <Suspense
        fallback={
          <Center mih="75vh">
            <Loader />
          </Center>
        }
      >
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
