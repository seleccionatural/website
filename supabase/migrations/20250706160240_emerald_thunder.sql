/*
  # Create website_media table for storing artwork and video information

  1. New Tables
    - `website_media`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz, default now())
      - `name` (text, required) - Original filename or link name
      - `url` (text, required) - Public URL to the media file or external link
      - `type` (text, required) - MIME type or link type (e.g., 'image/jpeg', 'video-link')
      - `title` (text, optional) - Display title for the media
      - `description` (text, optional) - Description of the media
      - `mediaType` (text, required) - Either 'artwork' or 'video'
      - `isExternalLink` (boolean, default false) - Whether this is an external link or uploaded file
      - `storagePath` (text, optional) - Path in Supabase storage (for uploaded files only)

  2. Security
    - Enable RLS on `website_media` table
    - Add policy for public read access (since this is for a public portfolio)
    - Add policy for authenticated users to manage media (admin functionality)

  3. Indexes
    - Index on mediaType for efficient filtering
    - Index on created_at for ordering
*/

-- Create the website_media table
CREATE TABLE IF NOT EXISTS website_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  url text NOT NULL,
  type text NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  mediaType text NOT NULL CHECK (mediaType IN ('artwork', 'video')),
  isExternalLink boolean DEFAULT false,
  storagePath text
);

-- Enable Row Level Security
ALTER TABLE website_media ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (portfolio is public)
CREATE POLICY "Public read access for website_media"
  ON website_media
  FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated users to insert media
CREATE POLICY "Authenticated users can insert media"
  ON website_media
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for authenticated users to update media
CREATE POLICY "Authenticated users can update media"
  ON website_media
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users to delete media
CREATE POLICY "Authenticated users can delete media"
  ON website_media
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_website_media_mediatype ON website_media(mediaType);
CREATE INDEX IF NOT EXISTS idx_website_media_created_at ON website_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_media_external_link ON website_media(isExternalLink);