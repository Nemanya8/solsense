// Token management service

const TOKEN_KEY = 'solsense_token';
const USER_KEY = 'solsense_user';

// Function to get the token from localStorage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

// Function to save the token to localStorage
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

// Function to remove the token from localStorage
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUser = (): any => {
  if (typeof window === 'undefined') return null;
  const userString = localStorage.getItem(USER_KEY);
  if (!userString) return null;
  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setUser = (user: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Function to remove the user from localStorage
export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
};

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Function to handle logout
export const logout = (): void => {
  removeToken();
  removeUser();
}; 