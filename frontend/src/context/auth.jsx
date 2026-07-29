import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const authUtils = {
	setTokens: ({ accessToken, user }) => {
		localStorage.setItem("token", accessToken);
		localStorage.setItem("user", JSON.stringify(user));
	},
	getAccessToken: () => localStorage.getItem("token"),
	clearTokens: () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},
	isAuthenticated: () => !!localStorage.getItem("token"),
};

// api/inventoryApi.js and friends call through the global axios instance, so the
// bearer token has to be attached here or those requests go out anonymous.
axios.interceptors.request.use((config) => {
	const token = authUtils.getAccessToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

const getInitialUser = () => {
	const userJson = localStorage.getItem("user");
	if (authUtils.isAuthenticated() && userJson) {
		return JSON.parse(userJson);
	}
	return null;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(getInitialUser);

	const login = (userData) => setUser(userData);

	const logout = async () => {
		authUtils.clearTokens();
		setUser(null);
	};

	const value = {
		user,
		logout,
		login,
		checkRole: (r) => user?.position === r,
		isAuthenticated: authUtils.isAuthenticated(),
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
