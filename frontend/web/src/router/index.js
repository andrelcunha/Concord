import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/Login.vue'
import Channels from '@/views/ChannelsView.vue'
import { useAuthStore } from '@/stores/auth';

const routes = [
  { path: '/login', name: 'login', component: Login },
  { path: '/channels', name: 'channels', component: Channels },
  { path: '/', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  console.log('Router guard: isAuthenticated:', isAuthenticated, 'to=', to.path)
  if (to.path !== '/login' && !isAuthenticated) {
    console.log('Router guard: redirecting to login')
    next('/login')
  } else {
    next()
  }
})
export default router
