import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import ChannelsView from '@/views/ChannelsView.vue'
import Login from '@/components/Login.vue'

const routes = [
  { path: '/login', name: 'login', component: Login },
  { path: '/channels', name: 'channels', component: ChannelsView },
  { path: '/', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // const authStore = useAuthStore()
  const isAuthenticated = !!localStorage.getItem('access_token')
  if (to.path === '/login' && isAuthenticated) {
    next('/channels')
  } else if (to.path !== '/login' && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
export default router
