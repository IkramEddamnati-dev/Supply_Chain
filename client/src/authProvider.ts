import { AuthProvider } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth-token";
// Defining the authProvider with token validation
export const authProvider: AuthProvider = {
  // Login function
  

  // Check if the user is authenticated based on the token
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      // If no token is found, the user is not authenticated
      return { authenticated: false };
    }

    try {
      // Decode and validate token (optional)
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // decode JWT token
      const expirationTime = decodedToken?.exp;
      
      if (expirationTime && Date.now() >= expirationTime * 1000) {
        // If the token is expired, consider the user not authenticated
        localStorage.removeItem(TOKEN_KEY);
        return { authenticated: false };
      }

      // If token exists and is not expired, return authenticated
      return { authenticated: true };
    } catch (error) {
      // If decoding the token fails, return as not authenticated
      localStorage.removeItem(TOKEN_KEY);
      return { authenticated: false };
    }
  },

  // Logout action to clear the token
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  // Error handler for failed requests
  onError: async (error) => {
    if (error.response?.status === 401) {
      // Logout if an unauthorized request is encountered
      return {
        logout: true,
      };
    }

    // For any other errors, return the error
    return { error };
  },
};
