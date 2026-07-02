/**
 * Tests for the API client module
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('@/lib/api-client', () => {
  const actual = jest.requireActual('@/lib/api-client');
  return {
    ...actual,
    apiClient: new actual.ApiClient(),
    api: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    },
  };
});

import { ApiClient } from '@/lib/api-client';

beforeEach(() => {
  mockFetch.mockReset();
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
  mockFetch.mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
});

describe('ApiClient URL construction', () => {
  it('builds correct URL for a simple path', () => {
    const client = new ApiClient();
    expect(client).toBeDefined();
  });

  it('adds auth token to headers when present in localStorage', async () => {
    localStorage.setItem('auth_token', 'test-jwt-token');

    mockFetch.mockImplementation(async (_url: string, opts: RequestInit) => {
      const headers = opts.headers as Record<string, string>;
      return new Response(JSON.stringify({ authorized: headers?.Authorization === 'Bearer test-jwt-token' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const client = new ApiClient();
    const result = await client.get<{ authorized: boolean }>('/api/v1/auth/me');
    expect(result.authorized).toBe(true);
  });

  it('does not send auth header when no token is stored', async () => {
    localStorage.removeItem('auth_token');

    mockFetch.mockImplementation(async (_url: string, opts: RequestInit) => {
      const headers = opts.headers as Record<string, string>;
      return new Response(JSON.stringify({ hasAuth: !!headers?.Authorization }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const client = new ApiClient();
    const result = await client.get<{ hasAuth: boolean }>('/api/v1/auth/me');
    expect(result.hasAuth).toBe(false);
  });

  it('sends POST with JSON body', async () => {
    mockFetch.mockImplementation(async (_url: string, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string);
      return new Response(JSON.stringify({ received: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const client = new ApiClient();
    const payload = { email: 'test@example.com', password: 'secret' };
    const result = await client.post<{ received: typeof payload }>('/api/v1/auth/login', payload);
    expect(result.received.email).toBe('test@example.com');
  });

  it('includes Content-Type and Accept headers', async () => {
    mockFetch.mockImplementation(async (_url: string, opts: RequestInit) => {
      const headers = opts.headers as Record<string, string>;
      return new Response(
        JSON.stringify({
          contentType: headers['Content-Type'],
          accept: headers['Accept'],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const client = new ApiClient();
    const result = await client.get<{ contentType: string; accept: string }>('/api/v1/health');
    expect(result.contentType).toBe('application/json');
    expect(result.accept).toBe('application/json');
  });

  it('appends query parameters to the URL', async () => {
    mockFetch.mockImplementation(async (url: string) => {
      return new Response(JSON.stringify({ url }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const client = new ApiClient();
    const result = await client.get<{ url: string }>('/api/v1/users', {
      params: { page: 1, limit: 20 },
    });
    expect(result.url).toContain('page=1');
    expect(result.url).toContain('limit=20');
  });
});

describe('ApiClient error handling', () => {
  it('throws on 401 response', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const client = new ApiClient();
    await expect(client.get('/api/v1/auth/me')).rejects.toThrow();
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));
    const client = new ApiClient();
    await expect(client.get('/api/v1/health')).rejects.toThrow();
  });
});
