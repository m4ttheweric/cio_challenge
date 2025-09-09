import { useCallback } from 'react';
import { useLoadingState } from '@m4ttheweric/use-loading-state';
import { Container, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useLogin } from '@/api/hooks';
import { AuthenticationForm } from '@/components/AuthForm';

export function LoginPage() {
  const login = useLogin();
  const [task, { isLoading }] = useLoadingState();

  const handleLogin = useCallback(
    async (values: { email: string; password: string }) => {
      try {
        await task(() => login.mutateAsync(values));
      } catch (error) {
        console.error('Login failed', error);
        notifications.show({
          title: 'Login failed',
          message: (error as Error)?.message || 'Please try again',
          color: 'red',
        });
      }
    },
    [login]
  );

  return (
    <Container p="xl" size="xs" pos="relative">
      <LoadingOverlay visible={isLoading} />
      <AuthenticationForm onSubmit={handleLogin} />
    </Container>
  );
}
