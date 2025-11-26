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
};