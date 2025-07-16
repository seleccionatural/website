import React, { useRef, useEffect, useState } from 'react';
import { X, ExternalLink, AlertCircle, RefreshCw, Download, Info } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  isExternalLink?: boolean;
  type: string;
  thumbnailUrl?: string; // Custom thumbnail URL
}

interface VideoDetailsModalProps {
  video: VideoItem;
  onClose: () => void;
}

const VideoDetailsModal: React.FC<VideoDetailsModalProps> = ({ video, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration?: number;
    videoWidth?: number;
    videoHeight?: number;
  }>({});

  // CRITICAL: Function to get YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // CRITICAL: Function to get Vimeo video ID from URL
  const getVimeoVideoId = (url: string): string | null => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // CRITICAL: Function to generate embed URL for external videos
  const getEmbedUrl = (url: string): string | null => {
    // YouTube embed
    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
    }

    // Vimeo embed
    const vimeoId = getVimeoVideoId(url);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
    }

    // For other external links, return null (will show external link button)
    return null;
  };

  // Auto-focus and configure video when modal opens
  useEffect(() => {
    if (!video.isExternalLink && videoRef.current && !videoError) {
      const videoElement = videoRef.current;
      
      // CRITICAL: Enhanced configuration for large file streaming
      videoElement.preload = 'metadata'; // Load metadata first, then stream content
      videoElement.volume = 0.7; // Set reasonable volume
      
      // CRITICAL: Configure for large file streaming and CORS
      videoElement.setAttribute('crossorigin', 'anonymous');
      
      console.log('Video modal opened for uploaded file:', {
        url: video.url,
        type: video.type,
        isExternal: video.isExternalLink
      });
    } else if (video.isExternalLink) {
      console.log('Video modal opened for external link:', {
        url: video.url,
        embedUrl: getEmbedUrl(video.url),
        type: video.type,
        isExternal: video.isExternalLink
      });
      setIsLoading(false); // External videos don't need loading state
    }
  }, [video.isExternalLink, videoError]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Enhanced video error handler with detailed error information
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget;
    const error = videoElement.error;
    
    let errorMessage = 'This video cannot be played.';
    let technicalDetails = '';
    let suggestions = '';
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted.';
          technicalDetails = 'The video download was aborted by the user or network.';
          suggestions = 'Try refreshing the page or check your internet connection.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error occurred while loading the video.';
          technicalDetails = 'A network error caused the video download to fail. This often happens with large files (>10MB) or slow connections.';
          suggestions = 'Check your internet connection and try again. For large files, ensure you have a stable connection and try the direct link.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video format is not supported by your browser.';
          technicalDetails = 'The video is corrupted or uses an unsupported codec.';
          suggestions = 'Try re-encoding the video to H.264/MP4 format for better browser compatibility.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format or source is not supported.';
          technicalDetails = 'The video format is not supported by your browser or the file URL is incorrect.';
          suggestions = 'Supported formats: MP4 (H.264), WebM (VP8/VP9), OGG (Theora). Check if the file URL is accessible.';
          break;
        default:
          errorMessage = 'An unknown error occurred.';
          technicalDetails = 'Please try refreshing the page or contact support if the problem persists.';
          suggestions = 'Try the direct link or contact support for assistance.';
      }
    }
    
    console.error('Video playback error:', {
      error: error,
      code: error?.code,
      message: error?.message,
      videoUrl: video.url,
      videoType: video.type,
      networkState: videoElement.networkState,
      readyState: videoElement.readyState
    });
    
    setVideoError(true);
    setErrorDetails(`${errorMessage} ${technicalDetails} ${suggestions}`);
    setIsLoading(false);
    setVideoLoaded(false);
  };

  // Handle successful video loading
  const handleVideoLoad = () => {
    console.log('Video loaded successfully:', video.url);
    setVideoLoaded(true);
    setVideoError(false);
    setIsLoading(false);
    setErrorDetails('');
  };

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      setVideoMetadata({
        duration: videoElement.duration,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight
      });
      console.log('Video metadata loaded:', {
        duration: videoElement.duration,
        dimensions: `${videoElement.videoWidth}x${videoElement.videoHeight}`,
        url: video.url
      });
    }
  };

  // Handle video loading start
  const handleLoadStart = () => {
    console.log('Video loading started:', video.url);
    setIsLoading(true);
    setVideoError(false);
  };

  // Handle video can play
  const handleCanPlay = () => {
    console.log('Video can play:', video.url);
    setIsLoading(false);
    setVideoLoaded(true);
  };

  // Retry video loading
  const handleRetry = () => {
    if (videoRef.current) {
      setIsRetrying(true);
      setVideoError(false);
      setErrorDetails('');
      setIsLoading(true);
      setVideoLoaded(false);
      
      // Force reload the video
      const videoElement = videoRef.current;
      const currentTime = videoElement.currentTime;
      videoElement.load();
      
      // Restore playback position after reload
      videoElement.addEventListener('loadedmetadata', () => {
        videoElement.currentTime = currentTime;
      }, { once: true });
      
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);
    }
  };

  // Check if the video URL is accessible
  const isVideoAccessible = () => {
    try {
      const url = new URL(video.url);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  };

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get embed URL for external videos
  const embedUrl = video.isExternalLink ? getEmbedUrl(video.url) : null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[100] p-4"
      onClick={handleBackdropClick}
    >
      {/* FIXED: Reduced modal size to fit desktop screen properly */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Main modal content - REDESIGNED: Video-focused layout with proper sizing */}
        <div className="bg-gray-800 rounded-2xl md:rounded-[38px] p-4 md:p-6 relative animate-in fade-in zoom-in duration-300 max-h-full overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white transition-colors duration-200 z-10 bg-black bg-opacity-50 rounded-full p-2"
          >
            <X size={20} className="md:w-6 md:h-6" />
          </button>

          {/* REDESIGNED: Video-first layout with proper sizing */}
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Video Player Container - CRITICAL: Properly sized to fit screen */}
            <div className="w-full">
              <div className="w-full h-64 md:h-80 lg:h-[400px] xl:h-[450px] bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden relative">
                
                {/* CRITICAL: External video embed (YouTube, Vimeo, etc.) */}
                {video.isExternalLink && embedUrl ? (
                  <div className="relative w-full h-full">
                    {/* Loading overlay for iframe */}
                    {isLoading && (
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-white text-sm">Loading external video...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* CRITICAL: Responsive iframe for external video embedding */}
                    <iframe
                      ref={iframeRef}
                      src={embedUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => {
                        console.log('External video iframe loaded:', embedUrl);
                        setIsLoading(false);
                      }}
                      onError={() => {
                        console.error('External video iframe failed to load:', embedUrl);
                        setIsLoading(false);
                      }}
                    />
                  </div>
                ) : video.isExternalLink ? (
                  // External link that can't be embedded - show link button
                  <div 
                    onClick={() => window.open(video.url, '_blank')}
                    className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors duration-200 relative overflow-hidden"
                  >
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    </div>
                    
                    <ExternalLink className="w-16 h-16 md:w-20 md:h-20 text-white mb-4 drop-shadow-lg relative z-10" />
                    <p className="text-white text-xl md:text-2xl font-semibold mb-2 relative z-10">External Video</p>
                    <p className="text-gray-300 text-sm md:text-base text-center px-4 relative z-10">
                      Click to open in new tab
                    </p>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 opacity-20">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : videoError ? (
                  // Enhanced video error fallback with detailed information
                  <div className="w-full h-full bg-gray-700 flex flex-col items-center justify-center p-6 overflow-y-auto">
                    <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-red-400 mb-4" />
                    <p className="text-red-400 text-xl md:text-2xl font-semibold mb-4 text-center">Video Unavailable</p>
                    
                    {/* Error details */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-6 max-w-md w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-blue-400" />
                        <h4 className="text-white font-semibold">Error Details</h4>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">{errorDetails}</p>
                        
                        <div className="border-t border-gray-600 pt-2 mt-3">
                          <p className="text-gray-400 mb-1">
                            <strong>Video URL:</strong> 
                            <span className="break-all ml-1">{video.url}</span>
                          </p>
                          <p className="text-gray-400 mb-1">
                            <strong>Type:</strong> {video.type}
                          </p>
                          <p className="text-gray-400 mb-1">
                            <strong>Accessible:</strong> {isVideoAccessible() ? 'Yes' : 'No'}
                          </p>
                          <p className="text-gray-400">
                            <strong>External Link:</strong> {video.isExternalLink ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                      >
                        {isRetrying ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Retrying...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={16} />
                            Retry
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => window.open(video.url, '_blank')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                      >
                        <ExternalLink size={16} />
                        Direct Link
                      </button>
                      
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(video.url);
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                      >
                        <Download size={16} />
                        Copy URL
                      </button>
                    </div>
                  </div>
                ) : (
                  // CRITICAL: Enhanced video player for uploaded files with large file support
                  <div className="relative w-full h-full">
                    {/* Loading overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-white text-sm">Loading video...</p>
                          <p className="text-gray-400 text-xs mt-1">This may take a moment for large files</p>
                        </div>
                      </div>
                    )}
                    
                    {/* CRITICAL: Enhanced video element for large file streaming */}
                    <video 
                      ref={videoRef}
                      src={video.url}
                      controls
                      className="w-full h-full object-contain bg-black"
                      preload="metadata" // CRITICAL: Load metadata first for large files
                      crossOrigin="anonymous" // CRITICAL: Enable CORS for Supabase
                      playsInline // Better mobile support
                      onError={handleVideoError}
                      onLoadStart={handleLoadStart}
                      onLoadedMetadata={handleLoadedMetadata}
                      onCanPlay={handleCanPlay}
                      onLoadedData={handleVideoLoad}
                      onProgress={() => {
                        // Log buffering progress for large files
                        if (videoRef.current) {
                          const buffered = videoRef.current.buffered;
                          if (buffered.length > 0) {
                            const bufferedEnd = buffered.end(buffered.length - 1);
                            const duration = videoRef.current.duration;
                            if (duration > 0) {
                              const percentBuffered = (bufferedEnd / duration) * 100;
                              console.log(`Video buffered: ${percentBuffered.toFixed(1)}%`);
                            }
                          }
                        }
                      }}
                      onWaiting={() => {
                        console.log('Video is waiting for more data...');
                      }}
                      onPlaying={() => {
                        console.log('Video started playing');
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            </div>

            {/* Content - CRITICAL: Simplified to show only title and description (NO PURCHASE BUTTON) */}
            <div className="text-center md:text-left">
              {/* CRITICAL: Simplified content - only title and description */}
              <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 leading-tight">
                {video.title}
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                  {video.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailsModal;