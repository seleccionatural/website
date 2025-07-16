/*
  # Storage Policies for Media Bucket

  1. Storage Policies
    - Allow authenticated users to upload files to media bucket
    - Allow public read access to media bucket files
    - Allow authenticated users to delete their uploaded files
    - Allow authenticated users to update their uploaded files

  Note: These policies use Supabase's storage policy functions instead of direct table modifications
*/

-- Create storage policies for the media bucket using Supabase's storage policy functions

-- Policy to allow authenticated users to upload files to the media bucket
CREATE POLICY "Authenticated users can upload to media bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Policy to allow public read access to files in the media bucket
CREATE POLICY "Public read access for media bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

-- Policy to allow authenticated users to delete files from the media bucket
CREATE POLICY "Authenticated users can delete from media bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

-- Policy to allow authenticated users to update files in the media bucket
CREATE POLICY "Authenticated users can update media bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');