const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search';
const TRACK_ENDPOINT = 'https://api.spotify.com/v1/tracks';
const AUDIO_FEATURES_ENDPOINT = 'https://api.spotify.com/v1/audio-features';

const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second
const MAX_BACKOFF = 32000; // 32 seconds

let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

// Circuit breaker state
let consecutiveFailures = 0;
let circuitBreakerOpen = false;
let circuitBreakerResetTime: number | null = null;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_TIMEOUT = 60000; // 1 minute

interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}

class SpotifyApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public retryAfter?: number
  ) {
    super(`Spotify API Error: ${status} ${statusText}`);
    this.name = 'SpotifyApiError';
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const checkCircuitBreaker = () => {
  if (circuitBreakerOpen) {
    const now = Date.now();
    if (circuitBreakerResetTime && now >= circuitBreakerResetTime) {
      // Reset circuit breaker
      circuitBreakerOpen = false;
      circuitBreakerResetTime = null;
      consecutiveFailures = 0;
    } else {
      throw new Error('Spotify API circuit breaker is open. Too many consecutive failures.');
    }
  }
};

const recordFailure = () => {
  consecutiveFailures++;
  if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerOpen = true;
    circuitBreakerResetTime = Date.now() + CIRCUIT_BREAKER_RESET_TIMEOUT;
    console.error(`Circuit breaker opened after ${consecutiveFailures} consecutive failures`);
  }
};

const recordSuccess = () => {
  consecutiveFailures = 0;
};

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
};

const getClientCredentials = () => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    throw new Error('Spotify credentials are not configured');
  }

  return Buffer.from(`${client_id}:${client_secret}`).toString('base64');
};

const getAccessToken = async (retryCount = 0): Promise<{ access_token: string }> => {
  const now = Date.now();
  if (cachedToken && tokenExpiration && now < tokenExpiration) {
    return { access_token: cachedToken };
  }

  checkCircuitBreaker();

  try {
    const basic = getClientCredentials();

    const response = await fetchWithTimeout(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `Token request failed: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorBody) as SpotifyError;
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // Use default error message if parsing fails
      }

      console.error(`Spotify Token Error (${response.status}):`, errorBody);

      // Retry on 5xx server errors
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        const backoff = Math.min(INITIAL_BACKOFF * Math.pow(2, retryCount), MAX_BACKOFF);
        await sleep(backoff);
        return getAccessToken(retryCount + 1);
      }

      recordFailure();
      throw new SpotifyApiError(response.status, errorMessage);
    }

    const data = await response.json();

    if (!data.access_token) {
      recordFailure();
      throw new Error('No access token in response');
    }

    cachedToken = data.access_token;
    // expires_in is usually 3600 seconds. Subtract a small buffer (e.g. 60s)
    tokenExpiration = now + (data.expires_in || 3600) * 1000 - 60000;

    recordSuccess();
    return { access_token: data.access_token };
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error;
    }
    recordFailure();
    console.error('Unexpected error getting access token:', error);
    throw new Error(`Failed to get Spotify access token: ${(error as Error).message}`);
  }
};

const handleApiResponse = async (
  response: Response,
  endpoint: string,
  retryCount = 0,
  retryFn?: () => Promise<Response>
): Promise<unknown> => {
  // Handle rate limiting
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
    console.warn(`Rate limited on ${endpoint}. Retry after ${retryAfter} seconds`);

    if (retryCount < MAX_RETRIES && retryFn) {
      const waitTime = retryAfter * 1000;
      await sleep(waitTime);
      const retryResponse = await retryFn();
      return handleApiResponse(retryResponse, endpoint, retryCount + 1, retryFn);
    }

    recordFailure();
    throw new SpotifyApiError(429, 'Rate limit exceeded', retryAfter);
  }

  // Handle token expiration
  if (response.status === 401) {
    console.warn('Token expired, clearing cache');
    cachedToken = null;
    tokenExpiration = null;

    // Retry once with fresh token
    if (retryCount === 0 && retryFn) {
      const retryResponse = await retryFn();
      return handleApiResponse(retryResponse, endpoint, retryCount + 1, retryFn);
    }

    recordFailure();
    throw new SpotifyApiError(401, 'Unauthorized - invalid or expired token');
  }

  // Handle other errors
  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = response.statusText;

    try {
      const errorJson = JSON.parse(errorBody) as SpotifyError;
      if (errorJson.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch {
      // Use status text if parsing fails
    }

    console.error(`Spotify ${endpoint} Error (${response.status}):`, errorBody);

    // Retry on 5xx server errors
    if (response.status >= 500 && retryCount < MAX_RETRIES && retryFn) {
      const backoff = Math.min(INITIAL_BACKOFF * Math.pow(2, retryCount), MAX_BACKOFF);
      await sleep(backoff);
      const retryResponse = await retryFn();
      return handleApiResponse(retryResponse, endpoint, retryCount + 1, retryFn);
    }

    recordFailure();
    throw new SpotifyApiError(response.status, errorMessage);
  }

  recordSuccess();
  return response.json();
};

export const searchTracks = async (query: string, retryCount = 0) => {
  checkCircuitBreaker();

  try {
    const makeRequest = async () => {
      const { access_token } = await getAccessToken();
      return fetchWithTimeout(
        `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
    };

    const response = await makeRequest();
    return handleApiResponse(response, 'Search', retryCount, makeRequest);
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error;
    }
    console.error('Unexpected error searching tracks:', error);
    throw new Error(`Failed to search Spotify tracks: ${(error as Error).message}`);
  }
};

export const getTrack = async (trackId: string, retryCount = 0) => {
  checkCircuitBreaker();

  try {
    const makeRequest = async () => {
      const { access_token } = await getAccessToken();
      return fetchWithTimeout(`${TRACK_ENDPOINT}/${trackId}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    };

    const response = await makeRequest();
    return handleApiResponse(response, 'Track', retryCount, makeRequest);
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error;
    }
    console.error('Unexpected error getting track:', error);
    throw new Error(`Failed to get Spotify track: ${(error as Error).message}`);
  }
};

export const getAudioFeatures = async (trackId: string, retryCount = 0) => {
  checkCircuitBreaker();

  try {
    const makeRequest = async () => {
      const { access_token } = await getAccessToken();
      return fetchWithTimeout(`${AUDIO_FEATURES_ENDPOINT}/${trackId}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    };

    const response = await makeRequest();
    return handleApiResponse(response, 'Audio Features', retryCount, makeRequest);
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error;
    }
    console.error('Unexpected error getting audio features:', error);
    throw new Error(`Failed to get Spotify audio features: ${(error as Error).message}`);
  }
};

// Helper function to check if error is rate limit error
export const isRateLimitError = (error: unknown): error is SpotifyApiError => {
  return error instanceof SpotifyApiError && error.status === 429;
};

// Helper function to get retry after time from error
export const getRetryAfter = (error: unknown): number | undefined => {
  if (isRateLimitError(error)) {
    return error.retryAfter;
  }
  return undefined;
};

// Export for testing
export const resetCircuitBreaker = () => {
  consecutiveFailures = 0;
  circuitBreakerOpen = false;
  circuitBreakerResetTime = null;
};

// Export for testing
export const clearTokenCache = () => {
  cachedToken = null;
  tokenExpiration = null;
};
