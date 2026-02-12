// @ts-nocheck
import { NextResponse } from 'next/server';
import { getAudioFeatures } from '@/lib/spotify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Query parameter "id" is required' }, { status: 400 });
  }

  try {
    const features = await getAudioFeatures(id);

    if (features.error) {
      return NextResponse.json(
        { error: features.error.message },
        { status: features.error.status }
      );
    }

    return NextResponse.json({
      key: features.key,
      mode: features.mode,
      tempo: features.tempo,
      time_signature: features.time_signature,
      duration_ms: features.duration_ms,
    });
  } catch (error) {
    console.error('Spotify Features Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
