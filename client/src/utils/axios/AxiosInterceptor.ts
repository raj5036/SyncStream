import axios from "axios"
import { CommonUtils } from "../CommonUtils";
import { LOCAL_STORAGE_KEYS } from "../Constants";

const AxiosInterceptor = () => {
	// Create an instance of Axios
	const axiosInstance = axios.create({
		baseURL: import.meta.env.VITE_SERVER_API_PATH,
		headers: {
			"Content-Type": "application/json",
		}
	})

	// Request interceptor
	axiosInstance.interceptors.request.use(
		(config) => {
			const token = CommonUtils.getItemFromLocalStorage(LOCAL_STORAGE_KEYS.USER_TOKEN)
			if (token) {
				config.headers.Authorization = `Bearer ${token}`
			}
			return config
		},
		(error) => {
			return Promise.reject(error)
		}
	)

	// Response interceptor
	axiosInstance.interceptors.response.use(
		(response) => {
			// Any status code within the range of 2xx will trigger this function
			return response
		},
		(error) => {
			// Any status codes outside the range of 2xx trigger this function
			if (error.response && error.response.status === 401) {
				// Handle 401 Unauthorized errors (invalid or expired token)
				CommonUtils.logoutUser()
			}

			// Return a rejected promise to let the request fail
			return Promise.reject(error)
		}
	);

	return axiosInstance
};

export default AxiosInterceptor
