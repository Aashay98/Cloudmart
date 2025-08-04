import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, User, LogOut, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import SideBar from '../SideBar';
import { getUser, isAuthenticated, clearAuthData } from '../../utils/authUtils';
import { getCartItemsCount } from '../../utils/cartUtils';

const Header = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [userName, setUserName] = useState('Guest');
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User');
    }

    const updateCartCount = () => {
      setCartItemsCount(getCartItemsCount());
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const toggleSideBar = () => setIsSideBarOpen(!isSideBarOpen);

  const handleLogout = () => {
    clearAuthData();
    toast.success('Logged out successfully');
    navigate('/');
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    if (authenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSideBar} className="focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="text-2xl font-bold">CloudMart</Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center cursor-pointer hover:bg-blue-700 px-3 py-2 rounded-md transition-colors"
              >
                <User className="h-6 w-6 mr-2" />
                <span className="hidden md:inline">{userName}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {authenticated ? (
                    <>
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <Link to="/cart" className="relative cursor-pointer">
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <SideBar isOpen={isSideBarOpen} onClose={toggleSideBar} />
    </>
  );
};

export default Header;