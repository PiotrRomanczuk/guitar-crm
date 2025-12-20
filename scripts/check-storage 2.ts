
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkStorage() {
  console.log('Checking Supabase Storage Buckets...');
  
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }

  console.log('Buckets found:', buckets.map(b => b.name));

  const songImagesBucket = buckets.find(b => b.name === 'song-images');
  
  if (!songImagesBucket) {
    console.error('❌ Bucket "song-images" NOT found!');
    console.log('Attempting to create bucket "song-images"...');
    
    const { error: createError } = await supabase.storage.createBucket('song-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
    } else {
      console.log('✅ Bucket "song-images" created successfully!');
    }
  } else {
    console.log('✅ Bucket "song-images" found.');
    console.log('Public:', songImagesBucket.public);
    
    if (!songImagesBucket.public) {
      console.warn('⚠️ Bucket "song-images" is NOT public. Images might not load correctly.');
    }
  }
}

checkStorage();
