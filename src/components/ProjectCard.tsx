import React from 'react';

interface ProjectCardProps {
  title: string;
  category: string;
  description: string;
  image: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, category, description, image }) => {
  return (
    <div className="bg-gray-800 rounded-2xl md:rounded-[38px] p-4 md:p-7 mb-4 md:mb-6 group hover:bg-gray-750 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="flex-1 pr-0 md:pr-6 mb-4 md:mb-0 group-hover:translate-y-[-2px] transition-transform duration-300">
          <span className="text-gray-500 text-xs md:text-sm font-normal leading-relaxed">
            {category}
          </span>
          <h3 className="text-white text-lg md:text-2xl font-semibold leading-tight tracking-tight mt-1 md:mt-2 mb-2 md:mb-4">
            {title}
          </h3>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-full md:max-w-sm">
            {description}
          </p>
        </div>
        <div className="w-full md:w-48 h-32 md:h-48 bg-gray-700 rounded-2xl md:rounded-3xl overflow-hidden flex-shrink-0">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;