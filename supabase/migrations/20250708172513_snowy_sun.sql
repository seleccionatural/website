/*
  # Add type_detail and video_thumbnail_url columns to website_media table

  1. New Columns
    - `type_detail` (text, optional) - For image type classification (painting, sculpture, etc.)
    - `video_thumbnail_url` (text, optional) - Custom thumbnail URL for video files
    - `video_thumbnail_path` (text, optional) - Storage path for uploaded video thumbnails

  2. Updates
    - Add columns with proper defaults
    - Ensure backward compatibility
*/

-- Add type_detail column for images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'website_media' AND column_name = 'type_detail'
  ) THEN
    ALTER TABLE website_media ADD COLUMN type_detail text DEFAULT '';
  END IF;
END $$;

-- Add video_thumbnail_url column for custom video thumbnails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'website_media' AND column_name = 'video_thumbnail_url'
  ) THEN
    ALTER TABLE website_media ADD COLUMN video_thumbnail_url text;
  END IF;
END $$;

-- Add video_thumbnail_path column for storage path of uploaded thumbnails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'website_media' AND column_name = 'video_thumbnail_path'
  ) THEN
    ALTER TABLE website_media ADD COLUMN video_thumbnail_path text;
  END IF;
END $$;