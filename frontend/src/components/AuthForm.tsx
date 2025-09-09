import {
  Alert,
  Button,
  Group,
  List,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { InfoIcon } from 'lucide-react';

import { useAppContext } from '@/AppContext';

export function AuthenticationForm(props: {
  onSubmit: (values: { email: string; password: string }) => void;
}) {
  const { userEmail } = useAppContext();
  const form = useForm({
    initialValues: {
      email: userEmail ?? '',
      password: '',
    },

    validate: {
      email: val => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: val => (val.length <= 0 ? 'Please enter a password' : null),
    },
  });

  return (
    <Paper radius="md" p="lg" withBorder component={Stack}>
      <Text size="lg" fw={500}>
        Welcome!
      </Text>

      <Alert icon={<InfoIcon />}>
        <Stack gap="xs">
          <Text size="sm">Log in with these emails and any password:</Text>
          <List size="xs" withPadding>
            <List.Item>first@customer.io</List.Item>
            <List.Item>second@customer.io</List.Item>
            <List.Item>third@customer.io</List.Item>
          </List>
        </Stack>
      </Alert>

      <form
        onSubmit={form.onSubmit(values => {
          props.onSubmit(values);
        })}
      >
        <Stack>
          <TextInput
            required
            autoFocus={!userEmail}
            label="Email"
            placeholder="hello@customer.io"
            value={form.values.email}
            onChange={event =>
              form.setFieldValue('email', event.currentTarget.value)
            }
            error={form.errors.email && 'Invalid email'}
            radius="md"
          />

          <PasswordInput
            autoFocus={!!userEmail}
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={event =>
              form.setFieldValue('password', event.currentTarget.value)
            }
            error={
              form.errors.password &&
              'Password should include at least 6 characters'
            }
            radius="md"
          />
        </Stack>

        <Group justify="space-between" mt="xl">
          <Button type="submit" radius="xl">
            Submit
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
