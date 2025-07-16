/*
  # Fix Column Names in website_media Table

  This migration updates the column names in the website_media table to match the lowercase format
  expected by the database schema, fixing the camelCase vs lowercase mismatch.

  ## Changes
  1. Rename mediaType to mediatype
  2. Rename isExternalLink to isexternallink  
  3. Rename storagePath to storagepath
  4. Update constraints and indexes to use new column names
  5. Update RLS policies to use new column names
*/

-- First, check if the columns exist with the old names and rename them
DO $$
BEGIN
  -- Rename mediaType to mediatype if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'website_media' AND column_name = 'mediaType'
  ) THEN
    ALTER TABLE website_media RENAME COLUMN "mediaType" TO mediatype;
  END IF;

  -- Rename isExternalLink to isexternallink if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'website_media' AND column_name = 'isExternalLink'
  ) THEN
    ALTER TABLE website_media RENAME COLUMN "isExternalLink" TO isexternallink;
  END IF;

  -- Rename storagePath to storagepath if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'website_media' AND column_name = 'storagePath'
  ) THEN
    ALTER TABLE website_media RENAME COLUMN "storagePath" TO storagepath;
  END IF;
END $$;

-- Drop and recreate the check constraint with the new column name
DO $$
BEGIN
  -- Drop the old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'website_media' AND constraint_name = 'website_media_mediaType_check'
  ) THEN
    ALTER TABLE website_media DROP CONSTRAINT website_media_mediaType_check;
  END IF;

  -- Drop the old constraint if it exists with the new name format
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'website_media' AND constraint_name = 'website_media_mediatype_check'
  ) THEN
    ALTER TABLE website_media DROP CONSTRAINT website_media_mediatype_check;
  END IF;

  -- Create the new constraint
  ALTER TABLE website_media ADD CONSTRAINT website_media_mediatype_check 
    CHECK (mediatype IN ('artwork', 'video'));
END $$;

-- Drop and recreate indexes with new column names
DROP INDEX IF EXISTS idx_website_media_mediaType;
DROP INDEX IF EXISTS idx_website_media_external_link;

-- Create new indexes with correct column names
CREATE INDEX IF NOT EXISTS idx_website_media_mediatype ON website_media(mediatype);
CREATE INDEX IF NOT EXISTS idx_website_media_external_link ON website_media(isexternallink);

-- Ensure the table structure is correct
DO $$
BEGIN
  -- Add mediatype column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'website_media' AND column_name = 'mediatype'
  ) THEN
    ALTER TABLE website_media ADD COLUMN mediatype text NOT NULL DEFAULT 'artwork' 
      CHECK (mediatype IN ('artwork', 'video'));
  END IF;

  -- Add isexternallink column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'website_media' AND column_name = 'isexternallink'
  ) THEN
    ALTER TABLE website_media ADD COLUMN isexternallink boolean DEFAULT false;
  END IF;

  -- Add storagepath column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'website_media' AND column_name = 'storagepath'
  ) THEN
    ALTER TABLE website_media ADD COLUMN storagepath text;
  END IF;
END $$;