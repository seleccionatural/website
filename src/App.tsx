import React, { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ContentArea from './components/ContentArea';
import AdminMediaManager from './components/AdminMediaManager';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogoClick = () => {
    setCurrentPage('home');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  // Secret key combination to open admin (Ctrl+Shift+A)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setShowAdmin(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden font-inter">
      <Header onLogoClick={handleLogoClick} />
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      <ContentArea currentPage={currentPage} />
      
      {showAdmin && (
        <AdminMediaManager onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
}

export default App;