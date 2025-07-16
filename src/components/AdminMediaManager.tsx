import React, { useState, useEffect } from 'react';
import { supabase } from '../firebase/config';
import { X, Upload, Edit, Trash2, Save, Ambulance as Cancel, Image, Video, ExternalLink, AlertCircle, Check } from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  created_at: string;
  title?: string;
  description?: string;
  type_detail?: string; // NEW: Type classification for images
  mediatype: 'artwork' | 'video';
  isexternallink?: boolean;
  storagepath?: string;
  video_thumbnail_url?: string; // NEW: Custom video thumbnail
  video_thumbnail_path?: string; // NEW: Storage path for thumbnail
}

interface AdminMediaManagerProps {
  onClose: () => void;
}

const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({ onClose }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MediaItem>>({});
  
  // NEW: Active tab state for separating media types
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    thumbnailFile: null as File | null, // NEW: For video thumbnails
    title: '',
    description: '',
    type_detail: '', // NEW: For image type classification
    mediatype: 'artwork' as 'artwork' | 'video',
    isExternalLink: false,
    externalUrl: ''
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // CRITICAL: Fetch all media items from Supabase - NO LIMIT
  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      console.log('Fetching all media items from Supabase...');
      
      // CRITICAL: Remove any limit() calls to fetch ALL items
      const { data, error } = await supabase
        .from('website_media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching media items:', error);
        showNotification('error', 'Failed to load media items');
        return;
      }

      console.log(`Successfully fetched ${data?.length || 0} media items:`, data);
      setMediaItems(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching media items:', error);
      showNotification('error', 'Failed to load media items');
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // CRITICAL: Fixed update functionality with proper field handling
  const handleUpdate = async (id: string) => {
    try {
      console.log('Updating media item:', id, 'with data:', editForm);
      
      // CRITICAL: Ensure we only update fields that exist in the database schema
      const updateData: any = {};
      
      // Only include fields that have been modified and exist in schema
      if (editForm.title !== undefined) updateData.title = editForm.title;
      if (editForm.description !== undefined) updateData.description = editForm.description;
      if (editForm.type_detail !== undefined) updateData.type_detail = editForm.type_detail;
      if (editForm.name !== undefined) updateData.name = editForm.name;

      console.log('Final update data:', updateData);

      const { error } = await supabase
        .from('website_media')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating media item:', error);
        showNotification('error', `Failed to update: ${error.message}`);
        return;
      }

      console.log('Successfully updated media item:', id);
      showNotification('success', 'Media item updated successfully');
      
      // Refresh the media items list
      await fetchMediaItems();
      
      // Clear editing state
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating media item:', error);
      showNotification('error', 'Failed to update media item');
    }
  };

  const handleDelete = async (id: string, storagePath?: string) => {
    try {
      // Delete from storage if it's an uploaded file
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([storagePath]);
        
        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('website_media')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting media item:', error);
        showNotification('error', 'Failed to delete media item');
        return;
      }

      showNotification('success', 'Media item deleted successfully');
      fetchMediaItems();
    } catch (error) {
      console.error('Error deleting media item:', error);
      showNotification('error', 'Failed to delete media item');
    }
  };

  // CRITICAL: Enhanced upload function with video thumbnail support
  const handleUpload = async () => {
    if (uploadForm.isExternalLink) {
      await handleExternalLinkUpload();
    } else {
      await handleFileUpload();
    }
  };

  const handleFileUpload = async () => {
    if (!uploadForm.file) {
      showNotification('error', 'Please select a file to upload');
      return;
    }

    setUploading(true);
    
    try {
      // Determine file path based on media type
      const fileExtension = uploadForm.file.name.split('.').pop();
      const fileName = `${Date.now()}_${uploadForm.file.name}`;
      const filePath = uploadForm.mediatype === 'video' 
        ? `videos/${fileName}` 
        : `images/${fileName}`;

      console.log('Uploading file:', filePath);

      // Upload main file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, uploadForm.file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        showNotification('error', `Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // Get public URL for main file
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      let thumbnailUrl = null;
      let thumbnailPath = null;

      // CRITICAL: Handle video thumbnail upload if provided
      if (uploadForm.mediatype === 'video' && uploadForm.thumbnailFile) {
        const thumbnailExtension = uploadForm.thumbnailFile.name.split('.').pop();
        const thumbnailFileName = `${Date.now()}_thumbnail_${uploadForm.thumbnailFile.name}`;
        const thumbnailFilePath = `thumbnails/${thumbnailFileName}`;

        console.log('Uploading video thumbnail:', thumbnailFilePath);

        const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage
          .from('media')
          .upload(thumbnailFilePath, uploadForm.thumbnailFile);

        if (thumbnailUploadError) {
          console.error('Error uploading thumbnail:', thumbnailUploadError);
          showNotification('error', `Thumbnail upload failed: ${thumbnailUploadError.message}`);
        } else {
          const { data: thumbnailUrlData } = supabase.storage
            .from('media')
            .getPublicUrl(thumbnailFilePath);
          
          thumbnailUrl = thumbnailUrlData.publicUrl;
          thumbnailPath = thumbnailFilePath;
          console.log('Thumbnail uploaded successfully:', thumbnailUrl);
        }
      }

      // Save to database
      const mediaData = {
        name: uploadForm.file.name,
        url: urlData.publicUrl,
        type: uploadForm.file.type,
        title: uploadForm.title || uploadForm.file.name,
        description: uploadForm.description || '',
        type_detail: uploadForm.type_detail || '', // NEW: Type classification
        mediatype: uploadForm.mediatype,
        isexternallink: false,
        storagepath: filePath,
        video_thumbnail_url: thumbnailUrl, // NEW: Custom thumbnail URL
        video_thumbnail_path: thumbnailPath // NEW: Thumbnail storage path
      };

      console.log('Saving media data to database:', mediaData);

      const { error: dbError } = await supabase
        .from('website_media')
        .insert([mediaData]);

      if (dbError) {
        console.error('Error saving to database:', dbError);
        showNotification('error', `Database error: ${dbError.message}`);
        setUploading(false);
        return;
      }

      console.log('File uploaded and saved successfully');
      showNotification('success', 'File uploaded successfully');
      
      // Reset form
      setUploadForm({
        file: null,
        thumbnailFile: null,
        title: '',
        description: '',
        type_detail: '',
        mediatype: 'artwork',
        isExternalLink: false,
        externalUrl: ''
      });
      
      // Refresh media items
      fetchMediaItems();
    } catch (error) {
      console.error('Error during upload:', error);
      showNotification('error', 'Upload failed');
    }
    
    setUploading(false);
  };

  const handleExternalLinkUpload = async () => {
    if (!uploadForm.externalUrl) {
      showNotification('error', 'Please enter a valid URL');
      return;
    }

    setUploading(true);
    
    try {
      const mediaData = {
        name: uploadForm.title || 'External Link',
        url: uploadForm.externalUrl,
        type: uploadForm.mediatype === 'video' ? 'video-link' : 'image-link',
        title: uploadForm.title || 'External Link',
        description: uploadForm.description || '',
        type_detail: uploadForm.type_detail || '', // NEW: Type classification
        mediatype: uploadForm.mediatype,
        isexternallink: true,
        storagepath: null
      };

      console.log('Saving external link to database:', mediaData);

      const { error: dbError } = await supabase
        .from('website_media')
        .insert([mediaData]);

      if (dbError) {
        console.error('Error saving external link:', dbError);
        showNotification('error', `Database error: ${dbError.message}`);
        setUploading(false);
        return;
      }

      console.log('External link saved successfully');
      showNotification('success', 'External link added successfully');
      
      // Reset form
      setUploadForm({
        file: null,
        thumbnailFile: null,
        title: '',
        description: '',
        type_detail: '',
        mediatype: 'artwork',
        isExternalLink: false,
        externalUrl: ''
      });
      
      fetchMediaItems();
    } catch (error) {
      console.error('Error saving external link:', error);
      showNotification('error', 'Failed to save external link');
    }
    
    setUploading(false);
  };

  // CRITICAL: Proper edit form initialization with all fields
  const startEdit = (item: MediaItem) => {
    console.log('Starting edit for item:', item);
    setEditingId(item.id);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      type_detail: item.type_detail || '',
      name: item.name || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // NEW: Filter media items based on active tab
  const filteredMediaItems = mediaItems.filter(item => {
    if (activeTab === 'images') {
      return item.mediatype === 'artwork' || (item.isexternallink && item.type === 'image-link');
    } else {
      return item.mediatype === 'video' || (item.isexternallink && item.type === 'video-link');
    }
  });

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[200] p-4"
      onClick={handleBackdropClick}
    >
      {/* CRITICAL: Properly sized admin modal to fit desktop screen - Reduced to 80% width and constrained height */}
      <div className="bg-gray-800 rounded-2xl md:rounded-[38px] p-4 md:p-6 relative animate-in fade-in zoom-in duration-300 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white transition-colors duration-200 z-10"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>

        <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">Media Manager</h2>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-green-600 bg-opacity-20 border border-green-600 text-green-400'
              : 'bg-red-600 bg-opacity-20 border border-red-600 text-red-400'
          }`}>
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{notification.message}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Upload Section */}
          <div className="lg:w-1/3 space-y-4">
            <h3 className="text-white text-lg font-semibold">Upload Media</h3>
            
            {/* Media Type Selection */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Media Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadForm(prev => ({ ...prev, mediatype: 'artwork' }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    uploadForm.mediatype === 'artwork'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Image className="w-4 h-4 inline mr-1" />
                  Artwork
                </button>
                <button
                  onClick={() => setUploadForm(prev => ({ ...prev, mediatype: 'video' }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    uploadForm.mediatype === 'video'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Video className="w-4 h-4 inline mr-1" />
                  Video
                </button>
              </div>
            </div>

            {/* Upload Method Selection */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Upload Method</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadForm(prev => ({ ...prev, isExternalLink: false }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !uploadForm.isExternalLink
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-1" />
                  Upload File
                </button>
                <button
                  onClick={() => setUploadForm(prev => ({ ...prev, isExternalLink: true }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    uploadForm.isExternalLink
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <ExternalLink className="w-4 h-4 inline mr-1" />
                  External Link
                </button>
              </div>
            </div>

            {/* File Upload or External URL */}
            {uploadForm.isExternalLink ? (
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">External URL</label>
                <input
                  type="url"
                  value={uploadForm.externalUrl}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, externalUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-gray-700 text-white placeholder-gray-500 px-3 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            ) : (
              <>
                {/* Main File Upload */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">
                    {uploadForm.mediatype === 'video' ? 'Video File' : 'Image File'}
                  </label>
                  <input
                    type="file"
                    accept={uploadForm.mediatype === 'video' ? 'video/*' : 'image/*'}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>

                {/* CRITICAL: Video Thumbnail Upload - NEW FEATURE */}
                {uploadForm.mediatype === 'video' && (
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm">Video Thumbnail (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadForm(prev => ({ ...prev, thumbnailFile: e.target.files?.[0] || null }))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-green-600 file:text-white hover:file:bg-green-700"
                    />
                    <p className="text-gray-500 text-xs">Upload a custom thumbnail image for this video (max 5MB)</p>
                  </div>
                )}
              </>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Title</label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title"
                className="w-full bg-gray-700 text-white placeholder-gray-500 px-3 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Description</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                rows={3}
                className="w-full bg-gray-700 text-white placeholder-gray-500 px-3 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none"
              />
            </div>

            {/* CRITICAL: Type Detail for Images - NEW FEATURE */}
            {uploadForm.mediatype === 'artwork' && (
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Type Detail</label>
                <input
                  type="text"
                  value={uploadForm.type_detail}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, type_detail: e.target.value }))}
                  placeholder="e.g., painting, sculpture, photography, digital art"
                  className="w-full bg-gray-700 text-white placeholder-gray-500 px-3 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || (!uploadForm.file && !uploadForm.externalUrl)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              )}
            </button>
          </div>

          {/* CRITICAL: Media List with Tabs and Scrolling - Enhanced with proper sizing */}
          <div className="lg:w-2/3 flex flex-col">
            {/* NEW: Tab buttons for separating media types */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('images')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'images'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Image className="w-4 h-4 inline mr-2" />
                Images ({mediaItems.filter(item => item.mediatype === 'artwork' || (item.isexternallink && item.type === 'image-link')).length})
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'videos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Video className="w-4 h-4 inline mr-2" />
                Videos ({mediaItems.filter(item => item.mediatype === 'video' || (item.isexternallink && item.type === 'video-link')).length})
              </button>
            </div>
            
            <h3 className="text-white text-lg font-semibold mb-4">
              {activeTab === 'images' ? 'Image Library' : 'Video Library'}
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              /* CRITICAL: Scrollable container with hidden scrollbar and proper height - FITS DESKTOP SCREEN */
              <div className="flex-1 overflow-y-auto hide-scrollbar max-h-[50vh] pr-2">
                <div className="space-y-3">
                  {filteredMediaItems.map((item) => (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                          {item.mediatype === 'video' ? (
                            item.video_thumbnail_url ? (
                              <img 
                                src={item.video_thumbnail_url} 
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                <Video className="w-6 h-6 text-white" />
                              </div>
                            )
                          ) : (
                            <img 
                              src={item.url} 
                              alt={item.title || item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM0QjU1NjMiLz48dGV4dCB4PSIzMiIgeT0iMzIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzlFQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {editingId === item.id ? (
                            /* CRITICAL: Edit Form with proper field handling */
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Title"
                                className="w-full bg-gray-600 text-white placeholder-gray-400 px-3 py-2 rounded text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                              <textarea
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Description"
                                rows={2}
                                className="w-full bg-gray-600 text-white placeholder-gray-400 px-3 py-2 rounded text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                              />
                              {/* CRITICAL: Type detail editing for images */}
                              {item.mediatype === 'artwork' && (
                                <input
                                  type="text"
                                  value={editForm.type_detail || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, type_detail: e.target.value }))}
                                  placeholder="Type detail (e.g., painting, sculpture)"
                                  className="w-full bg-gray-600 text-white placeholder-gray-400 px-3 py-2 rounded text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdate(item.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                >
                                  <Save className="w-3 h-3" />
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                >
                                  <Cancel className="w-3 h-3" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Display Mode */
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-medium text-sm truncate">
                                  {item.title || item.name}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {item.isexternallink ? (
                                    <ExternalLink className="w-3 h-3 text-blue-400" />
                                  ) : (
                                    <Upload className="w-3 h-3 text-green-400" />
                                  )}
                                  <span className="text-xs text-gray-400 capitalize">
                                    {item.mediatype}
                                  </span>
                                </div>
                              </div>
                              
                              {item.description && (
                                <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              
                              {/* CRITICAL: Display type detail for images */}
                              {item.type_detail && (
                                <p className="text-blue-300 text-xs mb-2 capitalize">
                                  Type: {item.type_detail}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEdit(item)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.storagepath || undefined)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredMediaItems.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">
                        No {activeTab} found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMediaManager;