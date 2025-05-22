<template>
  <div class="flex h-screen bg-discord-bg">
    <!-- Sidebar -->
    <ChannelsView />
    <!-- Main Content -->
    <div class="flex-1">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import ChannelsView from '@/views/ChannelsView.vue'
</script>

<style scoped>
.bg-discord-bg {
  background-color: #36393f;
}
</style>