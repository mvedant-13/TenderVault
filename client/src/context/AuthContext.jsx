import { useState } from "react";
import { AuthContext } from "./AuthContextObject";
import { loginUser, registerUser } from "../api/authApi";

const getStoredAuth = () => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (storedToken && storedUser) {
    return { token: storedToken, user: JSON.parse(storedUser) };
  }
  return { token: null, user: null };
};

export const AuthProvider = ({ children }) => {
  const [{ token, user }, setAuth] = useState(getStoredAuth);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setAuth({ token: data.token, user: data.user });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    setAuth({ token: data.token, user: data.user });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
