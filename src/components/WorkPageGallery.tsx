import React, { useState, useEffect } from 'react';
import { supabase } from '../firebase/config';
import MediaDetailsModal from './MediaDetailsModal';

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
}

interface ArtworkItem {
  id: string;
  title: string;
  description: string;
  image: string;
  height: number;
  type_detail?: string; // NEW: Type classification
  isExternalLink?: boolean;
}

const WorkPageGallery: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null); // NEW: Track hovered item

  // Real-time listener for media items - FETCH ALL ITEMS WITHOUT LIMIT
  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        console.log('Fetching all artwork items from Supabase...');
        
        // CRITICAL: Remove any limit() calls to fetch ALL artwork items
        const { data, error } = await supabase
          .from('website_media')
          .select('*')
          .eq('mediatype', 'artwork')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching media items:', error);
          setError('Failed to load artworks');
          return;
        }

        console.log(`Successfully fetched ${data?.length || 0} artwork items:`, data);
        setMediaItems(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching media items:', error);
        setError('Failed to load artworks');
        setLoading(false);
      }
    };

    fetchMediaItems();

    // Set up real-time subscription for live updates
    const subscription = supabase
      .channel('artwork_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'website_media',
          filter: 'mediatype=eq.artwork'
        },
        (payload) => {
          console.log('Real-time artwork update:', payload);
          fetchMediaItems(); // Refresh the data when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter artworks only (both uploaded files and external links)
  const artworkItems = mediaItems.filter(item => 
    item.mediatype === 'artwork' || 
    (item.isexternallink && item.type === 'image-link')
  );

  // Convert MediaItem to ArtworkItem format for compatibility with modal
  const convertToArtworkItem = (mediaItem: MediaItem): ArtworkItem => {
    return {
      id: mediaItem.id,
      title: mediaItem.title || mediaItem.name,
      description: mediaItem.description || 'No description available',
      image: mediaItem.url,
      height: 0, // Not used in modal
      type_detail: mediaItem.type_detail, // NEW: Include type detail
      isExternalLink: mediaItem.isexternallink
    };
  };

  const handleArtworkClick = (mediaItem: MediaItem) => {
    const artworkItem = convertToArtworkItem(mediaItem);
    setSelectedArtwork(artworkItem);
  };

  const handleCloseModal = () => {
    setSelectedArtwork(null);
  };

  // NEW: Handle mouse enter for hover effect
  const handleMouseEnter = (itemId: string) => {
    setHoveredItem(itemId);
  };

  // NEW: Handle mouse leave for hover effect
  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  if (loading) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden md:block absolute right-4 lg:right-20 top-24 lg:top-32 w-[calc(100%-2rem)] lg:w-[780px] xl:w-[900px]">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="md:hidden absolute top-20 left-4 right-4 bottom-20 z-20">
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
        <div className="hidden md:block absolute right-4 lg:right-20 top-24 lg:top-32 w-[calc(100%-2rem)] lg:w-[780px] xl:w-[900px]">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400">{error}</p>
          </div>
        </div>

        {/* Mobile Error */}
        <div className="md:hidden absolute top-20 left-4 right-4 bottom-20 z-20">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (artworkItems.length === 0) {
    return (
      <>
        {/* Desktop Empty State */}
        <div className="hidden md:block absolute right-4 lg:right-20 top-24 lg:top-32 w-[calc(100%-2rem)] lg:w-[780px] xl:w-[900px]">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No artworks available</p>
          </div>
        </div>

        {/* Mobile Empty State */}
        <div className="md:hidden absolute top-20 left-4 right-4 bottom-20 z-20">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No artworks available</p>
          </div>
        </div>
      </>
    );
  }

  console.log(`Rendering ${artworkItems.length} artwork items in gallery`);

  return (
    <>
      {/* Desktop Pinterest-style Gallery - CRITICAL: Fixed scrolling and true masonry layout with spacing */}
      <div className="hidden md:block absolute right-4 lg:right-20 top-24 lg:top-32 w-[calc(100%-2rem)] lg:w-[780px] xl:w-[900px]">
        {/* CRITICAL: Enable full vertical scrolling with hidden scrollbar */}
        <div 
          className="h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden pr-4 hide-scrollbar"
        >
          {/* CRITICAL: True 3-column masonry layout using CSS columns with proper spacing */}
          <div className="columns-3 gap-4 space-y-0">
            {artworkItems.map((mediaItem) => (
              <div
                key={mediaItem.id}
                onClick={() => handleArtworkClick(mediaItem)}
                onMouseEnter={() => handleMouseEnter(mediaItem.id)}
                onMouseLeave={handleMouseLeave}
                className="break-inside-avoid mb-4 cursor-pointer group relative" // FIXED: Added mb-4 for vertical spacing
              >
                {/* CRITICAL: Container that adapts to image aspect ratio with proper spacing */}
                <div className="w-full bg-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] relative">
                  {/* CRITICAL: Image that maintains aspect ratio and fills column width */}
                  <img 
                    src={mediaItem.url} 
                    alt={mediaItem.title || mediaItem.name}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{
                      // Let the image determine its own height based on aspect ratio
                      display: 'block',
                      width: '100%',
                      height: 'auto'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error('Image failed to load:', mediaItem.url);
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGI1NTYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzllYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', mediaItem.url);
                    }}
                  />
                  
                  {/* NEW: Hover overlay with title and type detail - Enhanced for better readability */}
                  {hoveredItem === mediaItem.id && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex items-end p-4 transition-all duration-300">
                      <div className="transform transition-transform duration-300">
                        <h3 className="text-white font-semibold text-sm lg:text-base mb-1 drop-shadow-lg">
                          {mediaItem.title || mediaItem.name}
                        </h3>
                        {/* NEW: Display type detail on hover */}
                        {mediaItem.type_detail && (
                          <p className="text-blue-300 text-xs lg:text-sm font-medium drop-shadow-lg capitalize">
                            {mediaItem.type_detail}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Pinterest-style Gallery - CRITICAL: Redesigned to prioritize media with proper spacing */}
      <div className="md:hidden absolute top-16 left-2 right-2 bottom-16 z-20"> {/* FIXED: Adjusted positioning to prevent text overlap */}
        {/* CRITICAL: Enable full scrolling for mobile with hidden scrollbar */}
        <div className="h-full overflow-y-auto overflow-x-hidden pr-2 hide-scrollbar">
          {/* CRITICAL: 2-column masonry layout for mobile with enhanced spacing */}
          <div className="columns-2 gap-3 space-y-0">
            {artworkItems.map((mediaItem) => (
              <div
                key={mediaItem.id}
                onClick={() => handleArtworkClick(mediaItem)}
                onMouseEnter={() => handleMouseEnter(mediaItem.id)}
                onMouseLeave={handleMouseLeave}
                className="break-inside-avoid mb-3 cursor-pointer group relative" // FIXED: Added mb-3 for mobile spacing
              >
                {/* CRITICAL: Mobile container that preserves aspect ratio with enhanced media prominence */}
                <div className="w-full bg-gray-700 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] relative">
                  {/* CRITICAL: Mobile image with preserved aspect ratio - LARGER for media emphasis */}
                  <img 
                    src={mediaItem.url} 
                    alt={mediaItem.title || mediaItem.name}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: 'auto',
                      minHeight: '120px' // FIXED: Ensure minimum height for better mobile display
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error('Mobile image failed to load:', mediaItem.url);
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGI1NTYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzllYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  
                  {/* NEW: Mobile hover overlay - Simplified for touch devices */}
                  {hoveredItem === mediaItem.id && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex items-end p-3 transition-all duration-300">
                      <div className="transform transition-transform duration-300">
                        <h3 className="text-white font-semibold text-sm mb-1 drop-shadow-lg">
                          {mediaItem.title || mediaItem.name}
                        </h3>
                        {/* NEW: Display type detail on mobile hover/touch */}
                        {mediaItem.type_detail && (
                          <p className="text-blue-300 text-xs font-medium drop-shadow-lg capitalize">
                            {mediaItem.type_detail}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Details Modal - Enhanced with type detail */}
      {selectedArtwork && (
        <MediaDetailsModal 
          artwork={selectedArtwork} 
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default WorkPageGallery;