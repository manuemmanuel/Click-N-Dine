import { aeonik } from '@/fonts/fonts';

export default function RestaurantInfo() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl w-full mb-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Foodie Delight</h2>
          <p className="text-gray-600">Your premium dining destination</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">About Us</h3>
            <p className="text-gray-600">
              We offer a diverse menu featuring fresh, locally-sourced ingredients and 
              expertly crafted dishes. Our restaurant provides a warm, inviting atmosphere 
              perfect for any occasion.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">Operating Hours</h3>
            <div className="space-y-2 text-gray-600">
              <p>Monday - Friday: 11:00 AM - 10:00 PM</p>
              <p>Saturday - Sunday: 10:00 AM - 11:00 PM</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">Featured Meals</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-medium text-slate-900">Signature Burger</h4>
              <p className="text-sm text-gray-600">Premium beef patty with special sauce</p>
              <p className="text-red-600 font-medium mt-2">$12.99</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-medium text-slate-900">Fresh Pasta</h4>
              <p className="text-sm text-gray-600">Handmade pasta with truffle sauce</p>
              <p className="text-red-600 font-medium mt-2">$15.99</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-medium text-slate-900">Seafood Platter</h4>
              <p className="text-sm text-gray-600">Fresh catch of the day with sides</p>
              <p className="text-red-600 font-medium mt-2">$24.99</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 