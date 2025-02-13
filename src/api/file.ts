'use server';

import { createClient } from '../utils/supabase/server';

/**
 * Uploads a file to a specified Supabase bucket.
 * @param {string} userId - The ID of the user, used to rename the file.
 * @param {string} bucketId - The ID of the bucket where the file will be uploaded.
 * @param {FormData} file - The file to be uploaded.
 * @returns The uploaded file data or null if an error occurs.
 */
export const uploadFileToBucket = async (userId: string, bucketId: string, file: FormData) => {
  const supabase = createClient();
  try {
    // Check if the file object is not null and extract the file extension from the original file name
    const fileObject = file.get('file');
    if (!fileObject || !(fileObject instanceof File)) {
      throw new Error('File is missing or the provided file is not an instance of File');
    }

    const fileExtension = fileObject.name.split('.').pop();
    // Rename the file to userId.[original file extension]
    const fileName = `${userId}-${Math.random()}.${fileExtension}`;
    // Upload the file to the specified bucket
    const { data, error } = await supabase.storage.from(bucketId).upload(fileName, fileObject, {
      upsert: false,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading file to bucket:', error);
    return null;
  }
};

/**
 * Downloads a file from a specified Supabase bucket.
 * @param {string} bucketId - The ID of the bucket from where the file will be downloaded.
 * @param {string} fileName - The name of the file to be downloaded.
 * @returns The downloaded file data or null if an error occurs.
 */
export const downloadFileFromBucket = async (bucketId: string, fileName: string) => {
  const supabase = createClient();
  try {
    const { data } = await supabase.storage.from(bucketId).getPublicUrl(fileName);
    return data;
  } catch (error) {
    console.error('Error downloading file from bucket:', error);
    return null;
  }
};
