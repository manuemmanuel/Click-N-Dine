'use client';

import { useState } from 'react';
import MenuDisplay from '@/components/MenuDisplay';
import Navbar from '@/components/Navbar';

export default function MenuPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const tableId = '1'; // This should be passed from the URL or context in a real app

  const handleClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      {isMenuOpen && (
        <MenuDisplay 
          onClose={handleClose}
          tableId={tableId}
        />
      )}
    </div>
  );
} 