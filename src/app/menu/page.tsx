'use client';

import { useState } from 'react';
import { aeonik } from '@/fonts/fonts';
import Navbar from '@/components/Navbar';
import OrderChoiceModal from '@/components/OrderChoiceModal';
import MealOptions from '@/components/MealOptions';

const menuCategories = [
  { id: 'starters', name: 'Starters' },
  { id: 'main-course', name: 'Main Course' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'beverages', name: 'Beverages' },
];

const menuItems = {
  starters: [
    { id: 1, name: 'Bruschetta', description: 'Toasted bread with tomatoes, garlic, and basil', price: 8.99, category: 'starters' },
    { id: 2, name: 'Calamari', description: 'Crispy fried squid with marinara sauce', price: 12.99, category: 'starters' },
    { id: 3, name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and basil', price: 10.99, category: 'starters' },
  ],
  'main-course': [
    { id: 4, name: 'Grilled Salmon', description: 'Fresh salmon with seasonal vegetables', price: 24.99, category: 'main-course' },
    { id: 5, name: 'Beef Tenderloin', description: '8oz tenderloin with red wine sauce', price: 29.99, category: 'main-course' },
    { id: 6, name: 'Mushroom Risotto', description: 'Creamy risotto with wild mushrooms', price: 19.99, category: 'main-course' },
  ],
  desserts: [
    { id: 7, name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', price: 8.99, category: 'desserts' },
    { id: 8, name: 'Crème Brûlée', description: 'Vanilla custard with caramelized sugar', price: 7.99, category: 'desserts' },
    { id: 9, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with vanilla ice cream', price: 9.99, category: 'desserts' },
  ],
  beverages: [
    { id: 10, name: 'House Red Wine', description: 'Our signature red blend', price: 8.99, category: 'beverages' },
    { id: 11, name: 'Craft Beer', description: 'Selection of local craft beers', price: 6.99, category: 'beverages' },
    { id: 12, name: 'Signature Cocktail', description: 'Our special house cocktail', price: 12.99, category: 'beverages' },
  ],
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('starters');
  const [showOrderChoice, setShowOrderChoice] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string; price: number } | null>(null);
  const [showMealOptions, setShowMealOptions] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleAddToOrder = (item: { id: number; name: string; price: number }) => {
    setSelectedItem(item);
    setShowOrderChoice(true);
  };

  const handleOrderChoice = (userId: string) => {
    setSelectedUserId(userId);
    setShowMealOptions(true);
  };

  const handleCloseMealOptions = () => {
    setShowMealOptions(false);
    setSelectedUserId(null);
  };

  return (
    <div className={`${aeonik.variable} font-sans min-h-screen bg-gradient-to-b from-white to-gray-50 w-full`}>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] pt-16 bg-gradient-to-r from-red-600 to-red-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-6 px-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              Our <span className="text-yellow-400">Menu</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
              Discover our carefully curated selection of dishes
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Navigation */}
        <div className="flex overflow-x-auto pb-4 mb-8 space-x-4">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-red-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems[activeCategory as keyof typeof menuItems].map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-red-600">${item.price}</span>
                  <button 
                    onClick={() => handleAddToOrder(item)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Order Choice Modal */}
      {selectedItem && (
        <OrderChoiceModal
          isOpen={showOrderChoice}
          onClose={() => setShowOrderChoice(false)}
          onProceed={handleOrderChoice}
          item={selectedItem}
          menuItems={menuItems}
        />
      )}

      {/* Meal Options Modal */}
      {showMealOptions && selectedUserId && (
        <MealOptions
          userId={selectedUserId}
          onClose={handleCloseMealOptions}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Foodie</h4>
              <p className="text-gray-400">
                Experience the future of dining with our smart ordering system.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Hours</h4>
              <p className="text-gray-400">Monday - Friday: 11:00 AM - 10:00 PM</p>
              <p className="text-gray-400">Saturday - Sunday: 10:00 AM - 11:00 PM</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Contact</h4>
              <p className="text-gray-400">123 Restaurant Street</p>
              <p className="text-gray-400">City, State 12345</p>
              <p className="text-gray-400">Phone: (123) 456-7890</p>
              <a 
                href="https://wa.me/919497085797" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors flex items-center space-x-2 mt-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.287.129.332.202.045.073.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                </svg>
                <span>WhatsApp: +91 9497085797</span>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Foodie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 