<template>
  <div class="sidebar w-64 bg-discord-dark h-screen p-4">
    <div v-for="server in servers" :key="server.id" class="mb-2">
      <div
        class="p-2 rounded cursor-pointer hover:bg-discord-blurple"
        :class="{ 'bg-discord-blurple': selectedServer?.id === server.id }"
        @click="selectServer(server)"
      >
        {{ server.name }}
      </div>
      <div v-if="selectedServer?.id === server.id" class="ml-4">
        <div v-for="channel in channels" :key="channel.id" class="p-2 hover:bg-gray-700 rounded">
          <router-link :to="`/servers/${server.id}/channels/${channel.id}?name=${channel.name}`">
            # {{ channel.name }}
          </router-link>
        </div>
        <button class="p-2 text-sm text-gray-400" @click="showCreateChannel = true">
          Create Channel
        </button>
      </div>
    </div>
    <button class="p-2 bg-discord-blurple text-white rounded" @click="showCreateServer = true">
      Create Server
    </button>
    <Modal v-if="showCreateServer" @submit="createServer" @close="showCreateServer = false">
      <input v-model="newServerName" placeholder="Server Name" />
      <label><input type="checkbox" v-model="isPublic" /> Public</label>
    </Modal>
    <Modal v-if="showCreateChannel" @submit="createChannel" @close="showCreateChannel = false">
      <input v-model="newChannelName" placeholder="Channel Name" />
    </Modal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/axios'

const route = useRoute()
const servers = ref([])
const channels = ref([])
const selectedServer = ref(null)
const showCreateServer = ref(false)
const showCreateChannel = ref(false)
const newServerName = ref('')
const isPublic = ref(true)
const newChannelName = ref('')

async function fetchServers() {
  const { data } = await axios.get('/api/servers')
  servers.value = data
  if (data.length > 0 && !selectedServer.value) {
    selectServer(data[0])
  }
}

async function fetchChannels(serverId) {
  const { data } = await axios.get(`/api/channels?server_id=${serverId}`)
  channels.value = data
}

async function selectServer(server) {
  selectedServer.value = server
  await fetchChannels(server.id)
}

async function createServer() {
  const { data } = await axios.post('/api/servers', {
    name: newServerName.value,
    is_public: isPublic.value,
  })
  servers.value.push(data)
  newServerName.value = ''
  isPublic.value = true
  showCreateServer.value = false
  selectServer(data)
}

async function createChannel() {
  const { data } = await axios.post('/api/channels', {
    name: newChannelName.value,
    server_id: selectedServer.value.id,
  })
  channels.value.push(data)
  newChannelName.value = ''
  showCreateChannel.value = false
}

watch(
  () => route.path,
  () => {
    fetchServers()
  },
  { immediate: true }
)
</script>

<style scoped>
.bg-discord-dark {
  background-color: #202225;
}
.bg-discord-blurple {
  background-color: #5865f2;
}
</style>