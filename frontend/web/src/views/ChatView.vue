<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/api/axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const messages = ref([])
const content = ref('')
const isLoading = ref(false)
const channelName = computed(() => route.query.name || `${route.params.id}`)
let ws = null

const channelId = route.params.id

async function fetchMessages() {
  isLoading.value = true
  try {
    const response = await axios.get(`/api/channels/${channelId}/messages`)
    messages.value = response.data.map(msg => ({
      id: msg.id || msg.ID,
      channel_id: msg.channel_id || msg.ChannelID,
      user_id: msg.user_id || msg.UserID,
      content: msg.content || msg.Content,
      username: msg.username || msg.Username || 'Unknown',
      created_at: msg.created_at || msg.CreatedAt,
      avatar_url: msg.avatar_url || msg.AvatarURL,
      avatar_color: msg.avatar_color || msg.AvatarColor || '#FF6B6B',
    }))
  } catch (error) {
    console.error('Fetch messages error:', error.response?.data || error.message)
  } finally {
    isLoading.value = false
  }
}

function connectWebSocket() {
  const wsUrl = `${import.meta.env.VITE_WS_URL}/api/ws?channel_id=${channelId}&token=${encodeURIComponent(authStore.accessToken)}`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('WebSocket connected')
  }

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      const normalizedMessage = {
        id: message.id || message.ID,
        channel_id: message.channel_id || message.ChannelID,
        user_id: message.user_id || message.UserID,
        content: message.content || message.Content,
        username: message.username || message.Username || 'Unknown',
        created_at: message.created_at || message.CreatedAt,
        avatar_url: message.avatar_url || message.AvatarURL || null,
        avatar_color: message.avatar_color || message.AvatarColor || '#FF6B6B',
      }
      if (!messages.value.some(m => m.id === normalizedMessage.id)) {
        messages.value.push(normalizedMessage)
      }
    } catch (error) {
      console.error('WebSocket message error:', error)
    }
  }
  ws.onclose = () => {
    console.log('WebSocket closed')
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
}

async function sendMessage() {
  if (!content.value.trim()) return
  try {
    ws.send(JSON.stringify({ content: content.value }))
    content.value = ''
  } catch (error) {
    console.error('Send message error:', error)
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    authStore.logout()
    router.push('/login')
  } else {
    fetchMessages()
    connectWebSocket()
  }
})

onUnmounted(() => {
  if (ws) ws.close()
})
</script>

<template>
  <div class="chat flex-1 p-6">
    <h2 class="text-white text-xl mb-4">Channel #{{ channelName }}</h2>
    <div v-if="isLoading" class="text-gray-400">Loading messages...</div>
    <div class="messages bg-discord-chat rounded p-4 mb-4 h-[calc(100vh-200px)] overflow-y-auto">
      <div v-for="message in messages" :key="message.id" class="message text-gray-200 mb-2 flex items-start">
        <div v-if="message.avatar_url" class="w-8 h-8 rounded-full mr-2">
          <img :src="message.avatar_url" class="w-8 h-8 rounded-full mr-2" alt="User avatar" />
        </div>
        <div v-else 
          class="w-8 h-8 mr-2 flex items-center justify-center text-white font-bold rounded-full"
          :style="{ backgroundColor: message.avatar_color, lineHeight: '32px', fontSize: '16px', textAlign: 'center' }">
          {{ message.username[0] ? message.username[0].toUpperCase() : '?'}}
        </div>
        <div>
          <span class="user text-discord-blurple font-bold">{{ message.username }}</span>
          <span class="timestamp text-gray-500 text-sm ml-2">{{ new Date(message.created_at).toLocaleTimeString() }}</span>
            <div>{{ message.content }}</div>
        </div>
      </div>
    </div>
    <form @submit.prevent="sendMessage" class="flex">
      <input
        v-model="content"
        class="flex-1 p-2 bg-discord-input text-white rounded-l-md focus:outline-none"
        :placeholder="'Message # ' + channelName"
      />
      <button
        type="submit"
        class="bg-discord-blurple text-white p-2 rounded-r-md hover:bg-discord-blurple-hover"
      >
        Send
      </button>
    </form>
  </div>
</template>

<style scoped>
.bg-discord-chat {
  background-color: #313338;
}
.bg-discord-input {
  background-color: #202225;
}
.bg-discord-blurple {
  background-color: #5865f2;
}
.bg-discord-blurple-hover {
  background-color: #4752c4;
}
.text-discord-blurple {
  color: #5865f2;
}
.message:hover {
  background-color: #2f3136;
}
</style>
