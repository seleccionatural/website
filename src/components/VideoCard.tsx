import React from 'react';
import { Play } from 'lucide-react';

interface VideoCardProps {
  title: string;
  date: string;
  thumbnail: string;
  youtubeUrl: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, date, thumbnail, youtubeUrl }) => {
  const handleVideoClick = () => {
    window.open(youtubeUrl, '_blank');
  };

  return (
    <div 
      onClick={handleVideoClick}
      className="bg-gray-800 rounded-xl md:rounded-2xl p-3 md:p-4 group hover:bg-gray-750 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
    >
      <div className="relative w-full h-32 md:h-48 bg-gray-700 rounded-2xl md:rounded-3xl overflow-hidden mb-3 md:mb-4">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 md:w-8 md:h-8 text-black ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center group-hover:translate-y-[-2px] transition-transform duration-300">
        <h3 className="text-white text-base md:text-xl font-semibold">
          {title}
        </h3>
        <span className="text-gray-500 text-xs md:text-sm">
          {date}
        </span>
      </div>
    </div>
  );
};

export default VideoCard;