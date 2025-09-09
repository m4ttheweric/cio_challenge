// api/types.ts

/** ----- Shared ----- */

export type NotificationType = 'EMAIL' | 'SMS' | 'PUSH';

export interface Notification {
   id: string;
   userId: string;
   title: string;
   description: string;
   type: NotificationType;
   /** Stored as a string from the API (e.g., "2006-01-02 15:04:05") */
   createdAt: string;
}

/** API error envelope returned by the server on failures */
export interface ApiError {
   error: string;
}

/** ----- POST /login ----- */
// Request is form-encoded: { email }
export interface LoginRequest {
   email: string;
}

// Success: 200 { token }
export interface LoginResponse {
   token: string;
}

/** ----- GET /notifications (auth) ----- */
// Success: 200 Notification[]
export type GetNotificationsResponse = {
   notifications: Notification[];
   preferences: UserPreferences;
};

export interface UserPreferences {
   email: boolean;
   sms: boolean;
   push: boolean;
}

export type UpdatePreferencesResult =
   | { status: 200; body: UserPreferences }
   | { status: 204; body: undefined };

/** ----- GET /healthz ----- */
export type HealthResponse = {
   status: 'ok' | 'unhealthy';
};
