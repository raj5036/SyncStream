import { CommonUtils } from "./CommonUtils"
import { LOCAL_STORAGE_KEYS } from "./Constants";

export const isAuthenticated = (): boolean => {
	return !!CommonUtils.getItemFromLocalStorage(LOCAL_STORAGE_KEYS.USER_TOKEN);
};