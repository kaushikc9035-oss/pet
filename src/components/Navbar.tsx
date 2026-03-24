import { Link, useNavigate } from "react-router-dom";
import { PawPrint, Map as MapIcon, PlusCircle, Search, LogOut, User, MessageCircle } from "lucide-react";

export default function Navbar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold tracking-tight text-gray-900">PetFinder</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/browse" className="text-sm font-medium text-gray-600 hover:text-orange-500 flex items-center gap-1">
              <Search className="w-4 h-4" /> Browse
            </Link>
            <Link to="/map" className="text-sm font-medium text-gray-600 hover:text-orange-500 flex items-center gap-1">
              <MapIcon className="w-4 h-4" /> Map View
            </Link>
            <Link to="/report/lost" className="text-sm font-medium text-gray-600 hover:text-orange-500 flex items-center gap-1">
              <PlusCircle className="w-4 h-4" /> Report Lost
            </Link>
            <Link to="/report/found" className="text-sm font-medium text-gray-600 hover:text-orange-500 flex items-center gap-1">
              <PlusCircle className="w-4 h-4" /> Report Found
            </Link>
            <Link to="/chat" className="text-sm font-medium text-gray-600 hover:text-orange-500 flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Chat
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" /> {user.name}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
