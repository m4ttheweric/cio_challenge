// api/hooks.ts
import { useAppContext } from '@/AppContext';
import {
   QueryClient,
   useMutation,
   useQuery,
   useQueryClient
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
   GetNotificationsResponse,
   LoginRequest,
   LoginResponse,
   UpdatePreferencesResult,
   UserPreferences
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// single query client for your app
export const queryClient = new QueryClient();

// Parse JSON and handle 401 redirects centrally
async function parseJsonOrThrow<T>(
   res: Response,
   navigate: (to: string) => void
): Promise<T> {
   if (res.status === 401) {
      navigate('/login');
      throw new Error('Unauthorized');
   }
   if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
         const data = (await res.json()) as { error?: string };
         if (data?.error) msg = data.error;
      } catch {
         // ignore json parsing errors
      }
      throw new Error(msg);
   }
   return res.json() as Promise<T>;
}

// ---- hooks ----

export function useLogin() {
   const { setAuthToken, setUserEmail } = useAppContext();
   const navigate = useNavigate();

   return useMutation({
      mutationFn: async (req: LoginRequest) => {
         const body = new URLSearchParams({ email: req.email });
         const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body
         });
         return parseJsonOrThrow<LoginResponse>(res, navigate);
      },

      onSuccess: ({ token }, { email }) => {
         setAuthToken(token);
         setUserEmail(email);
         navigate('/'); // send them home after login
      }
   });
}

export function useNotifications() {
   const { authToken } = useAppContext();
   const navigate = useNavigate();

   return useQuery({
      queryKey: ['notifications'],
      enabled: !!authToken, // no token => don't fetch, no redirect here
      queryFn: async () => {
         const res = await fetch(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${authToken}` }
         });
         return parseJsonOrThrow<GetNotificationsResponse>(res, navigate);
      },
      staleTime: 30_000,
      retry: 1
   });
}

export function useUpdatePreferences() {
   const { authToken } = useAppContext();
   const qc = useQueryClient();
   const navigate = useNavigate();

   return useMutation({
      mutationFn: async (
         patch: UserPreferences
      ): Promise<UpdatePreferencesResult> => {
         const res = await fetch(`${BASE_URL}/preferences`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify(patch)
         });

         if (res.status === 204) {
            return { status: 204, body: undefined };
         }

         return {
            status: 200,
            body: await parseJsonOrThrow<UserPreferences>(res, navigate)
         };
      },
      onSuccess: () => {
         // prefs can change which notifications are visible
         qc.invalidateQueries({ queryKey: ['notifications'] });
      }
   });
}
