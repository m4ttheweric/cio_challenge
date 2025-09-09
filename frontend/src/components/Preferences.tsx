import { useCallback, useMemo } from 'react';
import { useLoadingState } from '@m4ttheweric/use-loading-state';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  Stack,
  Text,
} from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { AlertCircle } from 'lucide-react';

import { useNotifications, useUpdatePreferences } from '@/api/hooks';
import { UserPreferences } from '@/api/types';

const initialValues = (userPreferences: UserPreferences) => {
  return [
    {
      label: 'Email',
      checked: userPreferences.email,
      key: 'email' as keyof UserPreferences,
    },
    {
      label: 'SMS',
      checked: userPreferences.sms,
      key: 'sms' as keyof UserPreferences,
    },
    {
      label: 'Push',
      checked: userPreferences.push,
      key: 'push' as keyof UserPreferences,
    },
  ];
};

// using a loader component pattern here so that the UI component will always have a defined set of preferences
// and won't have to deal with undefined or partial preferences
// this also keeps the loading and error state handling out of the UI component
// and allows us to keep the UI component focused on rendering the preferences form
export function PreferencesDataLoader({
  children,
}: {
  children: ({
    userPreferences,
    isLoading,
  }: {
    userPreferences: UserPreferences;
    isLoading: boolean;
  }) => React.ReactNode;
}) {
  const { data, isPending, isLoading, isError, error } = useNotifications();

  if (isPending) {
    return <LoadingOverlay visible />;
  }

  if (isError) {
    return (
      <Alert color="red" title="Error" icon={<AlertCircle size={16} />}>
        {error.message}
      </Alert>
    );
  }

  return <>{children({ userPreferences: data.preferences, isLoading })}</>;
}

export function Preferences({
  userPreferences,
  isLoading,
  onClose,
}: {
  userPreferences: UserPreferences;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [task, { isLoading: isUpdating }] = useLoadingState();
  const { mutateAsync: updatePreferences } = useUpdatePreferences();

  const [values, handlers] = useListState(initialValues(userPreferences));

  const allChecked = useMemo(
    () => values.every(value => value.checked),
    [values]
  );
  const indeterminate = useMemo(
    () => !allChecked && values.some(value => value.checked),
    [values, allChecked]
  );

  const handleSave = useCallback(() => {
    const patch = values.reduce<UserPreferences>((acc, curr) => {
      acc[curr.key] = curr.checked;
      return acc;
    }, {} as UserPreferences);

    task(() => updatePreferences(patch))
      .then(onClose)
      .catch(e => {
        notifications.show({
          color: 'red',
          title: 'Error',
          message: e.message,
        });
      });
  }, [updatePreferences, values, task]);

  return (
    <Stack pt={0} p="md" pos="relative">
      <Text>What type of notifications do you want to see?</Text>
      <Box>
        <Checkbox
          disabled={isLoading || isUpdating}
          checked={allChecked}
          indeterminate={indeterminate}
          label="View All"
          onChange={() =>
            handlers.setState(current =>
              current.map(value => ({ ...value, checked: !allChecked }))
            )
          }
        />
        {values.map((value, index) => (
          <Checkbox
            disabled={isLoading || isUpdating}
            mt="xs"
            ml={33}
            label={value.label}
            key={value.key}
            checked={value.checked}
            onChange={event =>
              handlers.setItemProp(
                index,
                'checked',
                event.currentTarget.checked
              )
            }
          />
        ))}
      </Box>

      <Group justify="flex-end">
        <Button
          disabled={isLoading || isUpdating}
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button loading={isLoading || isUpdating} onClick={handleSave}>
          Save
        </Button>
      </Group>
      <LoadingOverlay visible={isLoading || isUpdating} />
    </Stack>
  );
}
