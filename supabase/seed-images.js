const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.development' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const pathToEvents = 'public/recipes';
const pathToAvatars = 'public/users';

async function uploadImage(bucket, filePath) {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage.from(bucket).upload(`${fileName}`, fileContent, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Upload error:', error.message);
    return;
  }

  console.log('Uploaded:', data);
}

// Example usage
const imagesToUpload = [
  { bucket: 'avatars', filePath: `${pathToAvatars}/b02e2f4a-94ed-45ad-a745-435d986db886.png` },

  {
    bucket: 'event_thumbnails',
    filePath: `${pathToEvents}/9a6654b8-32c3-47a8-bd82-4ad16e299663.jpg`,
  },
  {
    bucket: 'event_thumbnails',
    filePath: `${pathToEvents}/295f43cc-c332-40ec-ab5e-467c663241fd.jpg`,
  },
  {
    bucket: 'event_thumbnails',
    filePath: `${pathToEvents}/514cec29-5a04-488a-8dad-5d43e861f3b8.png`,
  },
  {
    bucket: 'event_thumbnails',
    filePath: `${pathToEvents}/a3157df3-4b7b-451a-842b-0fe5e72ffdcf.jpg`,
  },
  {
    bucket: 'event_thumbnails',
    filePath: `${pathToEvents}/e89dd521-24a9-4ef0-9667-8a3c46433c85.png`,
  },
  {
    bucket: 'event_thumbnails',
    filePath: `${pathToEvents}/f90d618d-291e-4923-a083-2e44651a069f.jpg`,
  },
  {
    bucket: 'event_thumbnails',
    filePath: `${pathToEvents}/52e401c2-632c-4d96-9e4f-08d4f1c85ddd.png`,
  },

  { bucket: 'event_banners', filePath: `${pathToEvents}/9a6654b8-32c3-47a8-bd82-4ad16e299663.jpg` },
  { bucket: 'event_banners', filePath: `${pathToEvents}/295f43cc-c332-40ec-ab5e-467c663241fd.jpg` },
  { bucket: 'event_banners', filePath: `${pathToEvents}/514cec29-5a04-488a-8dad-5d43e861f3b8.png` },
  { bucket: 'event_banners', filePath: `${pathToEvents}/a3157df3-4b7b-451a-842b-0fe5e72ffdcf.jpg` },
  { bucket: 'event_banners', filePath: `${pathToEvents}/e89dd521-24a9-4ef0-9667-8a3c46433c85.png` },
  { bucket: 'event_banners', filePath: `${pathToEvents}/f90d618d-291e-4923-a083-2e44651a069f.jpg` },
  { bucket: 'event_banners', filePath: `${pathToEvents}/52e401c2-632c-4d96-9e4f-08d4f1c85ddd.png` },
];

imagesToUpload.forEach(({ bucket, filePath }) => uploadImage(bucket, filePath));
