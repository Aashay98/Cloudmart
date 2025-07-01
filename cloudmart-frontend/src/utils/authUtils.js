import Cookies from 'js-cookie';

const TOKEN_KEY = 'cloudmart_token';
const REFRESH_TOKEN_KEY = 'cloudmart_refresh_token';
const USER_KEY = 'cloudmart_user';

export const setAuthData = (token, refreshToken, user) => {
  // Store tokens in httpOnly cookies for better security
  Cookies.set(TOKEN_KEY, token, { 
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { 
    expires: 30, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  // Store user data in localStorage (non-sensitive data)
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const getUser = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const updateUser = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
  return userData;
};

export const clearAuthData = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

// Initialize user for backward compatibility
export const initializeUser = () => {
  const existingUser = getUser();
  if (!existingUser && !isAuthenticated()) {
    // Create anonymous user for demo purposes
    const randomNumber = Math.floor(Math.random() * 10000);
    const anonymousUser = {
      id: `anonymous_${randomNumber}`,
      email: `user${randomNumber}@example.com`,
      firstName: 'Anonymous',
      lastName: `User${randomNumber}`,
      phone: '',
      role: 'customer',
      isAnonymous: true
    };
    localStorage.setItem(USER_KEY, JSON.stringify(anonymousUser));
    return anonymousUser;
  }
  return existingUser;
};