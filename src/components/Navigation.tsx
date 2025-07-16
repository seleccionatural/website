import React from 'react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { name: 'Home', key: 'home' },
    { name: 'Videos', key: 'videos' },
    { name: 'Work', key: 'work' }
  ];

  return (
    <>
      {/* REDESIGNED: Single responsive navigation - NO separate mobile menu */}
      <nav className="absolute left-4 lg:left-20 top-24 lg:top-36 flex flex-col space-y-2 lg:space-y-4 z-30">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onPageChange(item.key)}
            className={`text-left text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold tracking-tight transition-colors duration-200 hover:text-white ${
              currentPage === item.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navigation;