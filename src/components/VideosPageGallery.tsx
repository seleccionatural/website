import React, { useState, useEffect } from 'react';
import { supabase } from '../firebase/config';
import { Play, ExternalLink, Video, Film, Camera, Clapperboard } from 'lucide-react';
import VideoDetailsModal from './VideoDetailsModal';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  created_at: string;
  title?: string;
  description?: string;
  mediatype: 'artwork' | 'video';
  isexternallink?: boolean;
  storagepath?: string;
  video_thumbnail_url?: string; // NEW: Custom video thumbnail
  video_thumbnail_path?: string; // NEW: Storage path for thumbnail
}

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  isExternalLink?: boolean;
  type: string;
  thumbnailUrl?: string; // NEW: Custom thumbnail URL
}

const VideosPageGallery: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for media items - FETCH ALL ITEMS WITHOUT LIMIT
  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        console.log('Fetching all video items from Supabase...');
        
        // CRITICAL: Remove any limit() calls to fetch ALL video items
        const { data, error } = await supabase
          .from('website_media')
          .select('*')
          .eq('mediatype', 'video')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching media items:', error);
          setError('Failed to load videos');
          return;
        }

        console.log(`Successfully fetched ${data?.length || 0} video items:`, data);
        setMediaItems(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching media items:', error);
        setError('Failed to load videos');
        setLoading(false);
      }
    };

    fetchMediaItems();

    // Set up real-time subscription for live updates
    const subscription = supabase
      .channel('video_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'website_media',
          filter: 'mediatype=eq.video'
        },
        (payload) => {
          console.log('Real-time video update:', payload);
          fetchMediaItems(); // Refresh the data when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter videos only (both uploaded files and external links)
  const videoItems = mediaItems.filter(item => 
    item.mediatype === 'video' || 
    (item.isexternallink && item.type === 'video-link')
  );

  // Function to get YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Function to get Vimeo video ID from URL
  const getVimeoVideoId = (url: string): string | null => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Function to get YouTube thumbnail
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return url; // Fallback to original URL
  };

  // Function to get Vimeo thumbnail (simplified - would need API call for real implementation)
  const getVimeoThumbnail = (url: string): string => {
    // For now, return a placeholder - in production, you'd use Vimeo's API
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDA5OGZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WaW1lbyBWaWRlbzwvdGV4dD48L3N2Zz4=';
  };

  // Convert MediaItem to VideoItem format for compatibility with modal
  const convertToVideoItem = (mediaItem: MediaItem): VideoItem => ({
    id: mediaItem.id,
    title: mediaItem.title || mediaItem.name,
    description: mediaItem.description || 'No description available',
    url: mediaItem.url,
    isExternalLink: mediaItem.isexternallink,
    type: mediaItem.type,
    thumbnailUrl: mediaItem.video_thumbnail_url // NEW: Include custom thumbnail
  });

  // CRITICAL: Function to handle video click - In-page modal for ALL videos (files and links)
  const handleVideoClick = (item: MediaItem) => {
    console.log('Opening video in modal:', item.url, 'External:', item.isexternallink);
    // CRITICAL: Open ALL videos in modal for in-page playback
    setSelectedVideo(convertToVideoItem(item));
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  // CRITICAL: Enhanced video thumbnail rendering with custom thumbnails and beautiful styled placeholders
  const renderVideoThumbnail = (item: MediaItem) => {
    // NEW: Check for custom uploaded thumbnail first
    if (item.video_thumbnail_url) {
      return (
        <img 
          src={item.video_thumbnail_url}
          alt={`${item.title || item.name} thumbnail`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error('Custom video thumbnail failed to load:', item.video_thumbnail_url);
            // Fallback to default placeholder if custom thumbnail fails
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WaWRlbyBGaWxlPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
      );
    }

    if (item.isexternallink) {
      // For external links, try to get platform-specific thumbnails
      let thumbnailUrl = '';
      
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        thumbnailUrl = getYouTubeThumbnail(item.url);
      } else if (item.url.includes('vimeo.com')) {
        thumbnailUrl = getVimeoThumbnail(item.url);
      } else {
        // Generic external video placeholder
        thumbnailUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FeHRlcm5hbCBWaWRlbzwvdGV4dD48L3N2Zz4=';
      }
      
      return (
        <img 
          src={thumbnailUrl}
          alt={item.title || item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error('External video thumbnail failed to load:', thumbnailUrl);
            // Fallback to a beautiful gradient placeholder
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmNTkzNDMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlZDRhN2IiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FeHRlcm5hbCBWaWRlbzwvdGV4dD48L3N2Zz4=';
          }}
        />
      );
    } else {
      // CRITICAL: For uploaded video files, show a beautifully styled video placeholder (enhanced design)
      return (
        <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Enhanced animated background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse"></div>
          </div>
          
          {/* Enhanced decorative elements */}
          <div className="absolute top-3 left-3 w-6 h-6 bg-white bg-opacity-25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 bg-white bg-opacity-20 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-4 w-3 h-3 bg-white bg-opacity-15 rounded-full animate-pulse delay-700"></div>
          
          {/* Main content with enhanced styling */}
          <div className="relative z-10 text-center">
            <div className="mb-3 relative">
              {/* Enhanced video icon with glow effect */}
              <div className="relative">
                <Clapperboard className="w-12 h-12 md:w-16 md:h-16 text-white mx-auto drop-shadow-2xl" />
                <div className="absolute inset-0 w-12 h-12 md:w-16 md:h-16 mx-auto bg-white rounded-full blur-xl opacity-30 animate-pulse"></div>
              </div>
            </div>
            
            <p className="text-white text-sm md:text-lg font-bold mb-1 drop-shadow-lg">
              Video File
            </p>
            <p className="text-white text-xs md:text-sm opacity-90 mb-2 drop-shadow-lg">
              Click to play
            </p>
            
            {/* Enhanced file type badge */}
            <div className="inline-flex items-center gap-1 bg-black bg-opacity-40 rounded-full px-2 py-1 backdrop-blur-sm">
              <Video className="w-2 h-2 md:w-3 md:h-3 text-white" />
              <span className="text-white text-xs font-medium">
                {item.type.split('/')[1]?.toUpperCase() || 'VIDEO'}
              </span>
            </div>
          </div>

          {/* Enhanced decorative corner elements */}
          <div className="absolute top-2 right-2 opacity-40">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div className="absolute bottom-2 left-2 opacity-40">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden md:block absolute right-4 lg:right-20 top-24 lg:top-32 w-[calc(100%-2rem)] md:w-[calc(100%-20rem)] lg:w-[780px] xl:w-[900px]">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="md:hidden absolute top-16 left-2 right-2 bottom-16 z-20">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Desktop Error */}
        <div className="hidden md:block absolute right-4 lg:right-20 top-24 lg:top-32 w-[calc(100%-2rem)] md:w-[calc(100%-20rem)] lg:w-[780px] xl:w-[900px]">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400">{error}</p>
          </div>
        </div>

        {/* Mobile Error */}
        <div className="md:hidden absolute top-16 left-2 right-2 bottom-16 z-20">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (videoItems.length === 0) {
    return (
      <>
        {/* Desktop Empty State */}
        <div className="hidden md:block absolute right-4 lg:right-20 top-24 lg:top-32 w-[calc(100%-2rem)] md:w-[calc(100%-20rem)] lg:w-[780px] xl:w-[900px]">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No videos available</p>
          </div>
        </div>

        {/* Mobile Empty State */}
        <div className="md:hidden absolute top-16 left-2 right-2 bottom-16 z-20">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No videos available</p>
          </div>
        </div>
      </>
    );
  }

  console.log(`Rendering ${videoItems.length} video items in gallery`);

  return (
    <>
      {/* Desktop Videos Grid - CRITICAL: Full scrolling enabled with hidden scrollbar and proper spacing */}
      <div className="hidden md:block absolute right-4 lg:right-20 top-24 lg:top-32 w-[calc(100%-2rem)] md:w-[calc(100%-20rem)] lg:w-[780px] xl:w-[900px]">
        {/* CRITICAL: Enable full scrolling for all video content with hidden scrollbar */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden pr-4 hide-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6"> {/* FIXED: Added proper gap spacing */}
            {videoItems.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="bg-gray-800 rounded-xl md:rounded-2xl p-3 md:p-4 group hover:bg-gray-750 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              >
                <div className="relative w-full h-32 md:h-48 bg-gray-700 rounded-2xl md:rounded-3xl overflow-hidden mb-3 md:mb-4">
                  {renderVideoThumbnail(video)}
                  
                  {/* Play button overlay - Enhanced styling */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white bg-opacity-95 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-black ml-1" fill="currentColor" />
                    </div>
                  </div>

                  {/* Video type indicator with enhanced styling */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-80 rounded-full px-3 py-1 backdrop-blur-sm">
                    <div className="flex items-center gap-1">
                      {video.isexternallink ? (
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      ) : (
                        <Video className="w-3 h-3 text-green-400" />
                      )}
                      <span className="text-white text-xs font-medium">
                        {video.isexternallink ? 'External' : 'File'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="group-hover:translate-y-[-2px] transition-transform duration-300">
                  <h3 className="text-white text-base md:text-xl font-semibold mb-2">
                    {video.title || video.name}
                  </h3>
                  {video.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      {video.isexternallink ? 'External Video' : 'Uploaded Video'}
                    </span>
                    <span className="text-blue-400 text-xs">Click to play</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Videos Grid - CRITICAL: Redesigned to prioritize media with enhanced spacing */}
      <div className="md:hidden absolute top-16 left-2 right-2 bottom-16 z-20"> {/* FIXED: Adjusted positioning to prevent text overlap */}
        {/* CRITICAL: Enable full scrolling for mobile with hidden scrollbar */}
        <div className="h-full overflow-y-auto overflow-x-hidden pr-2 hide-scrollbar">
          <div className="grid grid-cols-1 gap-4"> {/* FIXED: Enhanced spacing for mobile */}
            {videoItems.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="bg-gray-800 rounded-xl p-3 group hover:bg-gray-750 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              >
                <div className="relative w-full h-40 bg-gray-700 rounded-2xl overflow-hidden mb-3"> {/* FIXED: Increased height for better mobile media prominence */}
                  {renderVideoThumbnail(video)}
                  
                  {/* Play button overlay for mobile */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 bg-white bg-opacity-95 rounded-full flex items-center justify-center shadow-xl">
                      <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
                    </div>
                  </div>

                  {/* Video type indicator for mobile */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-80 rounded-full px-2 py-1">
                    <span className="text-white text-xs">
                      {video.isexternallink ? 'External' : 'File'}
                    </span>
                  </div>
                </div>
                
                <div className="group-hover:translate-y-[-2px] transition-transform duration-300">
                  <h3 className="text-white text-base font-semibold mb-2">
                    {video.title || video.name}
                  </h3>
                  {video.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      {video.isexternallink ? 'External Video' : 'Uploaded Video'}
                    </span>
                    <span className="text-blue-400 text-xs">Tap to play</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CRITICAL: Video Details Modal for in-page playback of ALL videos (files and links) */}
      {selectedVideo && (
        <VideoDetailsModal 
          video={selectedVideo} 
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default VideosPageGallery;