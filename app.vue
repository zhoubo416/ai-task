<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
const { fetchUser } = useAuth()

onMounted(() => {
  fetchUser()
})
</script>
