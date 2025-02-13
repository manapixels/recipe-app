'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

import Spinner from '@/_components/ui/Spinner';
import { uploadFileToBucket } from '@/api/file';
import { BUCKET_URL } from '@/constants';

export function FileUpload({
  className = '',
  currValue,
  userId,
  bucketId,
  label,
  onUploadComplete,
  register,
  validationSchema,
  name,
}) {
  const [uploaded, setUploaded] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (currValue && currValue !== uploadedImagePath && currValue !== '') {
      setUploadedImagePath(currValue);
      setUploaded(true);
    }
  }, [currValue]);

  const handleFileAccepted = async file => {
    setIsUploading(true);
    setImageLoading(true);
    try {
      // Create a new FormData object and append the file
      const formData = new FormData();
      formData.append('file', file);

      // Attempt to upload the file
      const uploadResult = await uploadFileToBucket(userId, bucketId, formData);
      console.log(uploadResult);

      // If successful, update the upload status and set the image URL
      setUploaded(true);
      if (uploadResult?.path) {
        onUploadComplete?.(uploadResult?.path);
        setUploadedImagePath(uploadResult.path);
      }
    } catch (error) {
      // Handle any errors
      console.error('Upload failed', error);
      setUploaded(false);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(
    acceptedFiles => {
      // Reset upload status on new drop
      setUploaded(false);
      setUploadedImagePath(''); // Reset the image URL on new drop
      handleFileAccepted(acceptedFiles[0]);
    },
    [handleFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-dashed border-2 border-gray-300 rounded-lg p-3 md:p-6 text-center cursor-pointer overflow-hidden ${isDragActive || isUploading || imageLoading ? 'bg-gray-100 animate-pulse' : 'bg-gray-50'} hover:bg-gray-100 ${className}`}
    >
      <input name={name} {...register(name, validationSchema)} {...getInputProps()} />
      {isDragActive ? (
        <p className="text-gray-700">Drop the files here ...</p>
      ) : uploaded ? (
        <div className="w-full h-full absolute top-0 left-0">
          {uploadedImagePath && (
            <Image
              className="rounded-md object-cover w-full h-full"
              src={`${BUCKET_URL}/${bucketId}/${uploadedImagePath}`}
              alt="Uploaded Image"
              sizes="100vw"
              fill
              onLoadingComplete={() => setImageLoading(false)}
            />
          )}
        </div>
      ) : isUploading || imageLoading ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <svg
              className="mx-auto"
              width="24px"
              height="24px"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="#000000"
            >
              <path
                d="M6 20L18 20"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M12 16V4M12 4L15.5 7.5M12 4L8.5 7.5"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </div>
          <p className="text-sm text-gray-700">
            <strong>Click to upload</strong> or drag and drop
          </p>
        </div>
      )}

      {label && (
        <div className="absolute bottom-0 left-0 p-2 bg-white bg-opacity-70 backdrop-blur-md z-10 w-full border border-gray-200 rounded-lg">
          <div className="text-xs font-medium text-gray-900 uppercase tracking-wider flex items-center justify-center gap-1">
            {label}{' '}
            {uploaded && (
              <span className="inline-block">
                <svg
                  width="20px"
                  height="20px"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="#000000"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="transparent"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="fill-green-500"
                  ></path>
                  <path
                    d="M7 12.5L10 15.5L17 8.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
