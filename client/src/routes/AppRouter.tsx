import { Navigate, useRoutes } from "react-router-dom";
import SignupPage from "../pages/SignupPage/SignupPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import ProtectedRoute from "../auth/ProtectedRoute";
import { isAuthenticated } from "../utils/Auth";
import HomePage from "../pages/HomePage/HomePage";

export default function AppRouter() {
	return useRoutes([
		{
			path: "auth",
			children: [
				{
					path: "login",
					element: !isAuthenticated() ? <LoginPage /> : <Navigate to="/" replace />
				},
				{
					path: "signup",
					element: !isAuthenticated() ? <SignupPage /> : <Navigate to="/" replace />
				},
			]
		},
		// Protected route
		{
			path: "/",
			element: (
				<ProtectedRoute>
					<HomePage />
				</ProtectedRoute>
			),
		},
		{
			path: "*",
			element: <Navigate to="/" />,
		},
	]);
}