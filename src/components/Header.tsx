import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-7 py-4 md:py-6">
      {/* Left Logo - Simple image, no effects */}
      <button 
        onClick={onLogoClick}
        className="block"
        aria-label="Home"
      >
        <img 
          src="/bluetag.png" 
          alt="Logo" 
          className="w-8 h-10 md:w-10 md:h-14 object-contain"
        />
      </button>

      {/* Right Logo - Using the new uploaded image */}
      <button 
        onClick={onLogoClick}
        className="block"
        aria-label="Home"
      >
        <img 
          src="/FIRMA-blau.png" 
          alt="Firma" 
          className="w-24 h-8 md:w-34 md:h-10 object-contain"
        />
      </button>
    </header>
  );
};

export default Header;