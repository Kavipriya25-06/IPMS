import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";

// Create AuthContext
const AuthContext = createContext(null);

// Custom hook to use AuthContext
const useAuth = () => {
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

  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  const inactivityTimer = useRef(null); // Store inactivity timer reference

  // // On initial load, retrieve user from localStorage
  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);

  // Login function
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

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    // clearTimeout(inactivityTimer.current); // Clear inactivity timer
  }, []);

  // const resetInactivityTimer = useCallback(() => {
  //   // clearTimeout(inactivityTimer.current); // clear existing timer
  //   if (inactivityTimer.current) {
  //     clearTimeout(inactivityTimer.current);
  //   }
  //   inactivityTimer.current = setTimeout(() => {
  //     alert("You have been logged out due to inactivity.");
  //     logout();
  //   }, 10 * 60 * 1000); // 10 minutes until logout
  // }, [logout]);

  const resetInactivityTimer = useCallback(() => {
    const now = Date.now();
    localStorage.setItem("lastActivity", now.toString());

    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current); // Clear existing timer
    }

    inactivityTimer.current = setTimeout(() => {
      alert("You have been logged out due to inactivity.");
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  // Check for inactivity on page load
  useEffect(() => {
    const storedLastActivity = localStorage.getItem("lastActivity");
    const now = Date.now();

    if (
      storedLastActivity &&
      now - parseInt(storedLastActivity, 10) > INACTIVITY_TIMEOUT
    ) {
      // If inactivity timeout has passed, logout
      logout();
    } else if (user) {
      // Otherwise, reset the timer
      resetInactivityTimer();
    }
  }, [user, logout, resetInactivityTimer]);

  useEffect(() => {
    if (user) {
      // resetInactivityTimer();

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

  // Utility to check if user has a specific role
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// export default AuthProvider;

// Named exports for consistency
export { AuthProvider, useAuth };
