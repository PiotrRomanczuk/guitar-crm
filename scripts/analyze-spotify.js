const fs = require('fs');
const https = require('https');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const CLIENT_ID = env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing Spotify credentials in .env.local');
  process.exit(1);
}

const request = (url, options, data) => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function main() {
  // 1. Get Token
  const authOptions = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  const authData = 'grant_type=client_credentials';
  const authRes = await request('https://accounts.spotify.com/api/token', authOptions, authData);
  const token = authRes.access_token;

  console.log('Got token...');

  // 2. Search for a track
  const searchRes = await request('https://api.spotify.com/v1/search?q=Hotel+California&type=track&limit=1', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const track = searchRes.tracks.items[0];
  console.log('\n--- TRACK DATA ---');
  console.log(JSON.stringify(track, null, 2));

  // 3. Get Audio Features
  const featuresRes = await request(`https://api.spotify.com/v1/audio-features/${track.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('\n--- AUDIO FEATURES ---');
  console.log(JSON.stringify(featuresRes, null, 2));
}

main().catch(console.error);
