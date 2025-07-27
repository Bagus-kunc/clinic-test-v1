// types.ts
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: number;
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

// constants.ts
export const API_ENDPOINTS = {
  GACHA_SPIN: 'gacha/spin',
  D_CLINIC: 'd/clinic',
} as const;

// useFetchApi.ts
import { Ref } from 'vue';
import { ApiResponse, FetchOptions } from './types';

interface RuntimeConfig {
  public: {
    API_URL: string;
  };
}

const useFetchApi = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  opts: FetchOptions = {},
): Promise<ApiResponse<T>> => {
  const config = useRuntimeConfig() as RuntimeConfig;

  // Cookie refs with proper typing
  const TOKEN = useCookie<string | null>('TOKEN');
  const USER = useCookie<Record<string, any> | null>('USER');
  const VALID_PASSWORD = useCookie<boolean | null>('VALID_PASSWORD');

  const clearAuth = () => {
    localStorage.clear();
    sessionStorage.clear();
    TOKEN.value = null;
    USER.value = null;
    VALID_PASSWORD.value = null;
  };

  let loading = true; // Indikator loading
  let errorMessage = ''; // Pesan error

  try {
    const response = await $fetch<ApiResponse<T>>(url, {
      ...opts,
      method,
      baseURL: config.public.API_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN.value ? { Authorization: `Bearer ${TOKEN.value}` } : {}),
        ...opts.headers,
      },
      params: {
        ...opts.params,
      },
      onRequestError({ error }) {
        console.error('Request error:', error);
        throw new Error('Network request error');
      },
      onResponseError({ response }) {
        const status = response?.status;

        if (status === 401) {
          clearAuth();
          navigateTo('/');
          throw new Error('Unauthorized access');
        }

        if (status === 404) {
          throw new Error('Resource not found');
        }

        if (status >= 500) {
          throw new Error('Server error occurred');
        }

        throw response; // Lemparkan error untuk kondisi lainnya
      },
    });

    loading = false;
    return response;
  } catch (error) {
    loading = false;
    errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API call failed:', errorMessage);
    throw error;
  }
};

export default useFetchApi;
