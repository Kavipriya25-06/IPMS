import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }); // Stores user info (email and role)

  // On initial load, retrieve user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Call API to authenticate user
      const response = await fetch("http://127.0.0.1:8000/register/");
      const users = await response.json();
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const loggedInUser = { email: foundUser.email, role: foundUser.role };

        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser)); // Persist user state
        resetInactivityTimer(); // Start inactivity timer on login
        return true;
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem("user"); // Clear persisted user state
  // };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    clearTimeout(inactivityTimer); // Clear inactivity timer
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      alert("You have been logged out due to inactivity.");
      logout();
    }, 10 * 60 * 1000); // 10 minutes until logout
  }, [logout]);

  useEffect(() => {
    if (user) {
      resetInactivityTimer();

      const handleActivity = () => resetInactivityTimer();
      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("keydown", handleActivity);
      window.addEventListener("click", handleActivity);

      return () => {
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("keydown", handleActivity);
        window.removeEventListener("click", handleActivity);
      };
    }
  }, [user, resetInactivityTimer]);

  let inactivityTimer;

  // Utility to check if user has a specific role
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
