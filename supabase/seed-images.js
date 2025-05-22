const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const pathToRecipeImages = 'public/recipes';
const pathToUserImages = 'public/users';

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
  { bucket: 'avatars', filePath: `${pathToUserImages}/b02e2f4a-94ed-45ad-a745-435d986db886.png` },

  {
    bucket: 'recipe_thumbnails',
    filePath: `${pathToRecipeImages}/d2d3c8a0-40a3-4a8e-8c6b-6f8e1a2b3c4d-thumbnail.jpg`,
  },
  {
    bucket: 'recipe_thumbnails',
    filePath: `${pathToRecipeImages}/f0f1f2f3-f4f5-f6f7-f8f9-fafbfcfdfeff-thumbnail.jpg`,
  },
  {
    bucket: 'recipe_banners',
    filePath: `${pathToRecipeImages}/d2d3c8a0-40a3-4a8e-8c6b-6f8e1a2b3c4d-banner.jpg`,
  },
  {
    bucket: 'recipe_banners',
    filePath: `${pathToRecipeImages}/f0f1f2f3-f4f5-f6f7-f8f9-fafbfcfdfeff-banner.jpg`,
  },
];

imagesToUpload.forEach(({ bucket, filePath }) => uploadImage(bucket, filePath));
