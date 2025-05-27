import { createRouter, createWebHistory } from 'vue-router'
import PlaceHolder from '@/views/PlaceHolderView.vue'
import Login from '@/components/Login.vue'
import Channels from '@/views/ChannelsView.vue'
import Chat from '@/views/ChatView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '/channels',  component: PlaceHolder, meta: { requiresAuth: true } },
      { path: '/channels/:id', component: Chat,     meta: { requiresAuth: true } }, 
      { path: '', redirect: '/channels' },
    ],
  },
  { path: '/login', name: 'login', component: Login },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    authStore.logout()
    next('/login')
  } else {
    next()
  }
})
export default router
