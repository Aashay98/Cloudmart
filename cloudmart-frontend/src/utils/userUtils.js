
const USER_KEY = 'cloudmart_user';

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const updateUser = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
  return userData;
};