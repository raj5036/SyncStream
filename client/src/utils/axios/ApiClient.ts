import AxiosInterceptor from "./AxiosInterceptor";

const axiosInstance = AxiosInterceptor();

export const ApiClient = {
	Auth: {
		login: (email: string, password: string) => {
			return Promise.resolve(
				axiosInstance.post("/auth/login", {email, password})
			)
				.then(res => res.data)
				.catch(err => {
					throw err
				})
		},
		signup: (email: string, password: string) => {
			return Promise.resolve(
				axiosInstance.post("/auth/signup", {email, password})
			)
				.then(res => res.data)
				.catch(err => {
					throw err
				})
		}
	},
};