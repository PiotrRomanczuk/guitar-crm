const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search';
const AUDIO_FEATURES_ENDPOINT = 'https://api.spotify.com/v1/audio-features';

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  return response.json();
};

export const searchTracks = async (query: string) => {
  const { access_token } = await getAccessToken();

  const response = await fetch(
    `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  return response.json();
};

export const getAudioFeatures = async (trackId: string) => {
  const { access_token } = await getAccessToken();

  const response = await fetch(`${AUDIO_FEATURES_ENDPOINT}/${trackId}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Spotify Audio Features Error (${response.status}):`, errorBody);
    throw new Error(`Spotify API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
