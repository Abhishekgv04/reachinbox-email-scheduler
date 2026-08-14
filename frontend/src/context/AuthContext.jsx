import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("reachinbox_user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "reachinbox_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(
        "reachinbox_user"
      );
    }
  }, [user]);

  function login(userData) {
    setUser(userData);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}