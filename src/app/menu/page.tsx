'use client';

import MenuDisplay from '@/components/MenuDisplay';
import Navbar from '@/components/Navbar';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <MenuDisplay />
    </div>
  );
} 