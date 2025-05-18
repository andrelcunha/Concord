import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const api = axios.create({
    baseURL: 'http://localhost:3000'
})

api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const authStore = useAuthStore();
        const router = useRouter();
        if (error.response?.status === 401 && authStore.refreshToken) {
            try{
                await authStore.refresh()
                error.config.headers.Authorization = `Bearer ${authStore.accessToken}`;
                return api(error.config);
            } catch(refreshError){
                authStore.logout();
                router.push('/login');
                return Promise.reject(refreshError);
            }
        }
    }
)

export default api