import type React from "react";
import { CommonUtils } from "../utils/CommonUtils";
import { LOCAL_STORAGE_KEYS } from "../utils/Constants";
import { Navigate } from "react-router-dom";

const isAuthenticated = (): boolean => {
	return !!CommonUtils.getItemFromLocalStorage(LOCAL_STORAGE_KEYS.USER_TOKEN);
};

export default function ProtectedRoute({ children }: { 
	children: React.ReactNode
}) {
	if (!isAuthenticated()) {
		return <Navigate to="/login" replace />;
	}
	return children;
};