import React from 'react';
import ProjectCard from './ProjectCard';
import VideosPageGallery from './VideosPageGallery';
import WorkPageGallery from './WorkPageGallery';

interface ContentAreaProps {
  currentPage: string;
}

const ContentArea: React.FC<ContentAreaProps> = ({ currentPage }) => {
  const projectsData = [
    {
      title: "Creative Digital Experience",
      category: "Obra",
      description: "It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing.",
      image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      title: "Modern Web Application",
      category: "Obra",
      description: "It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing.",
      image: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      title: "Brand Identity Design",
      category: "Obra",
      description: "It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing.",
      image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      title: "Mobile App Interface",
      category: "Obra",
      description: "It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing.",
      image: "https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  // FIXED: Repositioned text content to prevent overlap on all screen sizes
  const renderTextContent = (page: string) => {
    let text = '';
    switch (page) {
      case 'home':
        text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";
        break;
      case 'videos':
        text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen unchanged.";
        break;
      case 'work':
        text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since th unchanged.";
        break;
      default:
        text = '';
    }

    return (
      // CRITICAL: Repositioned to bottom-left with responsive safe positioning
      <div className="fixed bottom-8 left-4 lg:left-20 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[330px] z-30 bg-black bg-opacity-80 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
        <p className="text-white text-sm md:text-base lg:text-lg leading-relaxed font-normal">
          {text}
        </p>
      </div>
    );
  };

  const renderProjectsContent = () => (
    <>
      {/* Desktop Projects - Fully responsive with adjusted positioning */}
      <div className="hidden md:block absolute right-4 lg:right-20 top-28 lg:top-36 w-[calc(100%-2rem)] md:w-[calc(100%-18rem)] lg:w-[600px] xl:w-[700px]">
        <div className="space-y-4 lg:space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
          {projectsData.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              category={project.category}
              description={project.description}
              image={project.image}
            />
          ))}
        </div>
      </div>

      {/* Mobile Projects - Redesigned to mirror desktop layout */}
      <div className="md:hidden absolute top-32 left-4 right-4 bottom-32 z-20">
        <div className="space-y-4 max-h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
          {projectsData.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              category={project.category}
              description={project.description}
              image={project.image}
            />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="relative">
      {/* Text content for all pages - repositioned to prevent overlap */}
      {renderTextContent(currentPage)}
      
      {/* Page-specific content */}
      {currentPage === 'videos' && <VideosPageGallery />}
      {currentPage === 'work' && <WorkPageGallery />}
      {currentPage === 'home' && renderProjectsContent()}
    </div>
  );
};

export default ContentArea;