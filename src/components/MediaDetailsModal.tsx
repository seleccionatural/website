import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import PurchaseEmailModal from './PurchaseEmailModal';

interface ArtworkItem {
  id: string;
  title: string;
  description: string;
  image: string;
  height: number;
  type_detail?: string; // Type classification
  isExternalLink?: boolean;
}

interface MediaDetailsModalProps {
  artwork: ArtworkItem;
  onClose: () => void;
}

const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({ artwork, onClose }) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageLoad = () => {
    console.log('Modal image loaded successfully:', artwork.image);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Modal image failed to load:', artwork.image);
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4"
        onClick={handleBackdropClick}
      >
        {/* CRITICAL: Responsive modal that adapts to image size and maintains aspect ratio */}
        <div className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden">
          {/* Main modal content - CRITICAL: Flexible layout for different image aspect ratios */}
          <div className="bg-gray-800 rounded-2xl md:rounded-[38px] p-4 md:p-8 relative animate-in fade-in zoom-in duration-300 max-h-full overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white transition-colors duration-200 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>

            <div className="flex flex-col xl:flex-row gap-4 md:gap-8">
              {/* Image Container - CRITICAL: Preserve aspect ratio and prevent cropping */}
              <div className="flex-shrink-0 w-full xl:w-auto flex justify-center">
                <div className="relative">
                  {/* Loading state */}
                  {!imageLoaded && !imageError && (
                    <div className="w-full min-w-[300px] h-64 md:h-80 lg:h-[400px] bg-gray-700 rounded-2xl md:rounded-3xl flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Error state */}
                  {imageError && (
                    <div className="w-full min-w-[300px] h-64 md:h-80 lg:h-[400px] bg-gray-700 rounded-2xl md:rounded-3xl flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-red-400 mb-2">Failed to load image</p>
                        <p className="text-gray-400 text-sm break-all">{artwork.image}</p>
                      </div>
                    </div>
                  )}

                  {/* CRITICAL: Image with preserved aspect ratio - NO CROPPING */}
                  <img 
                    src={artwork.image} 
                    alt={artwork.title}
                    className={`
                      max-w-full max-h-[70vh] w-auto h-auto
                      object-contain rounded-2xl md:rounded-3xl 
                      shadow-2xl transition-opacity duration-300
                      ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}
                    `}
                    style={{
                      // CRITICAL: Let the image determine its own size within viewport constraints
                      minWidth: '300px', // Minimum width for very tall images
                      minHeight: '200px', // Minimum height for very wide images
                      maxWidth: '800px', // Maximum width to prevent oversized images
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              </div>

              {/* Content - CRITICAL: Simplified to show only title, type, description, and purchase button */}
              <div className="flex-1 flex flex-col justify-between min-h-auto xl:min-h-[400px]">
                <div>
                  {/* CRITICAL: Simplified content - title, type, and description only */}
                  <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4 leading-tight">
                    {artwork.title}
                  </h2>
                  
                  {/* Display type detail if available */}
                  {artwork.type_detail && (
                    <div className="mb-3 md:mb-4">
                      <span className="inline-block bg-blue-600 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {artwork.type_detail}
                      </span>
                    </div>
                  )}
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                      {artwork.description}
                    </p>
                  </div>
                </div>

                {/* CRITICAL: Purchase section */}
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-700">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Interested in this piece?</p>
                      <p className="text-white text-lg font-semibold">Contact for pricing and availability</p>
                    </div>
                    
                    <button
                      onClick={handlePurchaseClick}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-full transition-all duration-200 text-center text-sm md:text-base flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <ShoppingCart size={18} className="md:w-5 md:h-5" />
                      Purchase Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Email Modal */}
      {showPurchaseModal && (
        <PurchaseEmailModal 
          artworkTitle={artwork.title}
          artworkId={artwork.id}
          artworkDescription={artwork.description}
          artworkType={artwork.type_detail}
          artworkImage={artwork.image}
          onClose={handleClosePurchaseModal}
        />
      )}
    </>
  );
};

export default MediaDetailsModal;