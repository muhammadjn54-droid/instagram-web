import { igApi } from '@/store/api/baseApi';
import { API_ROUTES } from '@/lib/api/endpoints';
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SessionResponse,
} from '@/types';

/**
 * Account endpoints.
 *
 * `login`, `register` and `logout` are served by the **Next.js session
 * endpoints**, not by the NestJS proxy: they are the only requests that may
 * create or destroy the httpOnly session cookie.
 */
export const accountApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<SessionResponse, LoginInput>({
      query: (body) => ({
        url: '/api/session',
        method: 'POST',
        body,
        target: 'session',
      }),
      invalidatesTags: ['Account', 'Profile', 'Post', 'Chat', 'Story'],
    }),

    register: builder.mutation<SessionResponse, RegisterInput>({
      query: (body) => ({
        url: '/api/session/register',
        method: 'POST',
        body,
        target: 'session',
      }),
      invalidatesTags: ['Account', 'Profile', 'Post', 'Chat', 'Story'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/session',
        method: 'DELETE',
        target: 'session',
      }),
      invalidatesTags: ['Account', 'Profile', 'Post', 'Chat', 'Story'],
    }),

    /**
     * The backend has no mail service: `POST /account/forgot-password`
     * answers with the reset token itself (`"Password reset token has been
     * generated: reset-token-<id>"`). The token is surfaced to the user so
     * the flow stays usable. See `specs/API_INTEGRATION.md`.
     */
    forgotPassword: builder.mutation<string, ForgotPasswordInput>({
      query: (body) => ({
        url: API_ROUTES.account.forgotPassword,
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<string, ResetPasswordInput>({
      query: (body) => ({
        url: API_ROUTES.account.resetPassword,
        method: 'POST',
        body,
      }),
    }),

    changePassword: builder.mutation<string, ChangePasswordInput>({
      query: (body) => ({
        url: API_ROUTES.account.changePassword,
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = accountApi;
