import { AppRoutes } from "../routes/AppRoutes";
import { LOCAL_STORAGE_KEYS } from "./Constants";

export const CommonUtils = {
	setItemInLocalStorage: (key: string, value: any) => {
		localStorage.setItem(key, JSON.stringify(value));
	},
	getItemFromLocalStorage: (key: string) => {
		const value = localStorage.getItem(key);
		return value ? JSON.parse(value) : null;
	},
	removeItemFromLocalStorage: (key: string) => {
		localStorage.removeItem(key);
	},
	logoutUser: () => {
		CommonUtils.removeItemFromLocalStorage(LOCAL_STORAGE_KEYS.USER_DETAILS);
		CommonUtils.removeItemFromLocalStorage(LOCAL_STORAGE_KEYS.USER_TOKEN);
		window.location.href = AppRoutes.AUTH.LOGIN;
	}
};