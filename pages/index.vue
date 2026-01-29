<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <header class="border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          AI 任务系统
        </h1>
        <div class="flex items-center gap-3">
          <UBadge
            v-if="user"
            color="warning"
            variant="soft"
            size="lg"
          >
            积分: {{ user.points }}
          </UBadge>
          <UButton
            v-if="user"
            color="neutral"
            variant="soft"
            @click="logout"
          >
            退出
          </UButton>
          <UButton
            v-else
            color="neutral"
            variant="solid"
            @click="navigateTo('/login')"
          >
            登录
          </UButton>
          <UButton
            v-if="user?.isAdmin"
            color="success"
            variant="solid"
            @click="navigateTo('/admin')"
          >
            管理后台
          </UButton>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          v-if="!user"
          class="mx-auto max-w-md"
        >
          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">
                欢迎使用 AI 任务系统
              </h2>
            </template>
            <p class="text-muted mb-4">
              请先登录以查看和完成任务。
            </p>
            <UButton
              block
              size="lg"
              @click="navigateTo('/login')"
            >
              立即登录
            </UButton>
          </UCard>
        </div>

        <div v-else>
          <h2 class="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            任务列表
          </h2>
          <div
            v-if="loading"
            class="flex justify-center py-12"
          >
            <UIcon
              name="i-lucide-loader-circle"
              class="size-8 animate-spin text-gray-400"
            />
          </div>
          <div
            v-else-if="tasks.length === 0"
            class="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
          >
            暂无任务
          </div>
          <div
            v-else
            class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <UCard
              v-for="t in tasks"
              :key="t.id"
              variant="subtle"
              class="transition hover:shadow-lg"
              :ui="{ root: 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800' }"
            >
              <template #header>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ t.title }}
                </h3>
              </template>
              <p class="text-sm text-muted line-clamp-2">
                {{ t.description }}
              </p>
              <template #footer>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted">最高 {{ t.maxPoints }} 积分</span>
                  <UButton
                    size="sm"
                    color="primary"
                    trailing-icon="i-lucide-arrow-right"
                    @click="navigateTo(`/task/${t.id}`)"
                  >
                    开始任务
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const tasks = ref<Array<{ id: string; title: string; description: string; maxPoints: number }>>([])
const loading = ref(true)

onMounted(async () => {
  await loadTasks()
})

async function loadTasks() {
  try {
    loading.value = true
    tasks.value = await $fetch('/api/tasks')
  } catch (e) {
    console.error('加载任务失败:', e)
  } finally {
    loading.value = false
  }
}
</script>
