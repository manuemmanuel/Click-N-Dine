import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface OrderChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (userId: string) => void;
  item: {
    id: number;
    name: string;
    price: number;
  };
  menuItems: {
    [key: string]: MenuItem[];
  };
}

export default function OrderChoiceModal({ isOpen, onClose, onProceed, item, menuItems }: OrderChoiceModalProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [showInteractivePicker, setShowInteractivePicker] = useState(false);
  const [scannedUserId, setScannedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [activeCategory, setActiveCategory] = useState('starters');
  const [cart, setCart] = useState<MenuItem[]>([]);

  if (!isOpen) return null;

  const handleScan = (decodedText: string) => {
    setScannedUserId(decodedText);
    setError(null);
    if (scanner) {
      scanner.clear();
    }
  };

  const handleError = (errorMessage: string) => {
    if (errorMessage?.includes('NotFound')) return;
    setError(errorMessage);
  };

  const startScanner = () => {
    setShowScanner(true);
    const newScanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      false
    );

    setScanner(newScanner);

    newScanner.render(handleScan, handleError);
  };

  const handleProceed = () => {
    if (scannedUserId) {
      onProceed(scannedUserId);
      onClose();
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart([...cart, item]);
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleInteractiveProceed = () => {
    if (cart.length > 0) {
      onProceed('interactive');
      onClose();
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Add to Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showScanner && !showInteractivePicker ? (
          <div className="space-y-4">
            <div className="mb-6">
              <p className="text-gray-900 font-medium mb-2">Selected Item:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-red-600 font-semibold">${item.price}</p>
              </div>
            </div>

            <button
              onClick={startScanner}
              className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Scan QR Code</span>
            </button>
            <button
              onClick={() => setShowInteractivePicker(true)}
              className="w-full bg-white text-red-600 border-2 border-red-600 py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">Use Interactive Picker</span>
            </button>
          </div>
        ) : showScanner ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <div id="reader" className="w-full"></div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 font-medium text-center">{error}</p>
              </div>
            )}
            {scannedUserId && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-medium text-center">Successfully scanned!</p>
                </div>
                <button
                  onClick={handleProceed}
                  className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Continue with Order
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Category Navigation */}
            <div className="flex overflow-x-auto pb-4 space-x-4">
              {Object.keys(menuItems).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 rounded-full whitespace-nowrap transition-all font-medium ${
                    activeCategory === category
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-900 hover:bg-red-50'
                  }`}
                >
                  {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {menuItems[activeCategory].map((menuItem) => (
                <div
                  key={menuItem.id}
                  className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-red-200 transition-all"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{menuItem.name}</h3>
                  <p className="text-gray-700 mb-4">{menuItem.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-red-600">${menuItem.price}</span>
                    <button
                      onClick={() => handleAddToCart(menuItem)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Cart</h3>
                <div className="space-y-4">
                  {cart.map((cartItem) => (
                    <div key={cartItem.id} className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{cartItem.name}</h4>
                        <p className="text-sm text-gray-700">${cartItem.price}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(cartItem.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-red-600">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleInteractiveProceed}
                  className="w-full mt-6 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Proceed with Order
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}