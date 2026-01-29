<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <header class="border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-xl bg-primary-500 text-white">
            <UIcon name="i-lucide-layout-dashboard" class="size-5" />
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">管理后台</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">任务管理与配置</p>
          </div>
        </div>
        <div class="flex gap-2">
          <UButton color="neutral" variant="ghost" @click="navigateTo('/')">
            返回首页
          </UButton>
          <UButton color="neutral" variant="soft" @click="logout">
            退出
          </UButton>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <UAlert
          v-if="!user || !user.isAdmin"
          color="error"
          variant="soft"
          title="需要管理员权限"
        />

        <template v-else>
          <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <!-- 左侧：任务卡片 -->
            <section>
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">任务管理</h2>
                  <p class="text-xs text-gray-500 dark:text-gray-400">创建、编辑与维护任务</p>
                </div>
                <UButton
                  color="primary"
                  variant="solid"
                  icon="i-lucide-plus"
                  @click="beginCreate"
                >
                  新建任务
                </UButton>
              </div>

              <!-- 概览卡片 -->
              <div class="mb-4 grid gap-4 sm:grid-cols-3">
                <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <p class="text-xs text-gray-500 dark:text-gray-400">任务总数</p>
                  <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ totalTasks }}</p>
                </div>
                <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <p class="text-xs text-gray-500 dark:text-gray-400">启用中</p>
                  <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ activeTasks }}</p>
                </div>
                <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <p class="text-xs text-gray-500 dark:text-gray-400">完成率</p>
                  <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ completionRate }}%</p>
                </div>
              </div>

              <!-- 搜索与筛选 -->
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div class="flex min-w-[220px] flex-1 items-center gap-2">
                  <UInput
                    v-model="searchQuery"
                    icon="i-lucide-search"
                    placeholder="搜索任务标题或描述"
                    class="w-full"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    size="sm"
                    :variant="statusFilter === 'all' ? 'solid' : 'soft'"
                    color="neutral"
                    @click="statusFilter = 'all'"
                  >
                    全部
                  </UButton>
                  <UButton
                    size="sm"
                    :variant="statusFilter === 'active' ? 'solid' : 'soft'"
                    color="success"
                    @click="statusFilter = 'active'"
                  >
                    启用
                  </UButton>
                  <UButton
                    size="sm"
                    :variant="statusFilter === 'disabled' ? 'solid' : 'soft'"
                    color="neutral"
                    @click="statusFilter = 'disabled'"
                  >
                    禁用
                  </UButton>
                </div>
              </div>

              <div v-if="tasksLoading" class="flex justify-center py-12">
                <UIcon name="i-lucide-loader-circle" class="size-7 animate-spin text-gray-400" />
              </div>
              <div v-else-if="tasks.length === 0" class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                暂无任务
              </div>
              <div v-else-if="filteredTasks.length === 0" class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                没有匹配的任务
              </div>
              <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <UCard
                  v-for="t in filteredTasks"
                  :key="t.id"
                  variant="subtle"
                  class="cursor-pointer"
                  :class="selectedTaskId === t.id ? 'ring-2 ring-primary-400/70' : ''"
                  :ui="{ root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-md transition' }"
                  @click="beginView(t)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <h3 class="truncate text-base font-semibold text-gray-900 dark:text-white">
                        {{ t.title }}
                      </h3>
                      <p class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                        {{ t.description }}
                      </p>
                    </div>
                    <UBadge :color="t.isActive !== false ? 'success' : 'neutral'" variant="soft">
                      {{ t.isActive !== false ? '已启用' : '已禁用' }}
                    </UBadge>
                  </div>

                  <div class="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                      <UIcon name="i-lucide-users" class="size-4" />
                      {{ t.participationCount ?? 0 }}
                    </span>
                    <span class="flex items-center gap-1">
                      <UIcon name="i-lucide-check-circle-2" class="size-4" />
                      {{ t.completedCount ?? 0 }}
                    </span>
                    <span class="flex items-center gap-1">
                      <UIcon name="i-lucide-trophy" class="size-4" />
                      {{ t.maxPoints }}
                    </span>
                  </div>

                  <template #footer>
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <span class="text-xs text-gray-400">点击卡片查看详情</span>
                      <div class="flex flex-wrap gap-2">
                        <UButton size="xs" color="primary" variant="soft" @click.stop="beginEdit(t)">
                          编辑
                        </UButton>
                        <UButton size="xs" color="error" variant="soft" @click.stop="deleteTask(t)">
                          删除
                        </UButton>
                        <UButton size="xs" color="neutral" variant="ghost" @click.stop="toggleTaskStatus(t)">
                          {{ t.isActive !== false ? '禁用' : '启用' }}
                        </UButton>
                      </div>
                    </div>
                  </template>
                </UCard>
              </div>
            </section>

            <!-- 右侧：详情 / 编辑 / 新建 -->
            <aside class="space-y-4 lg:sticky lg:top-6 self-start">
              <UCard variant="subtle" :ui="{ root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800' }">
                <template #header>
                  <h2 class="text-lg font-semibold">
                    {{ panelMode === 'create' ? '创建新任务' : panelMode === 'edit' ? '编辑任务' : '任务详情' }}
                  </h2>
                </template>

                <div v-if="panelMode === 'view' && selectedTask" class="space-y-4 text-sm">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                      <p class="text-xs text-muted">参与人数</p>
                      <p class="mt-1 text-lg font-semibold">{{ selectedTask.participationCount ?? 0 }}</p>
                    </div>
                    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                      <p class="text-xs text-muted">完成人数</p>
                      <p class="mt-1 text-lg font-semibold">{{ selectedTask.completedCount ?? 0 }}</p>
                    </div>
                  </div>
                  <div>
                    <p class="text-xs text-muted">标题</p>
                    <p class="mt-1 font-medium">{{ selectedTask.title }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted">描述</p>
                    <p class="mt-1">{{ selectedTask.description }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted">AI 角色</p>
                    <p class="mt-1">{{ selectedTask.role }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted">任务目标</p>
                    <p class="mt-1">{{ selectedTask.goal }}</p>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-muted">最大积分</span>
                    <span class="font-semibold">{{ selectedTask.maxPoints }}</span>
                  </div>
                </div>

                <form v-else-if="panelMode === 'edit'" class="space-y-4" @submit.prevent="updateTask">
                  <UFormField label="任务标题" required>
                    <UInput
                      v-model="editTask.title"
                      placeholder="例如：让 AI 道歉"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UFormField label="任务描述" required>
                    <UTextarea
                      v-model="editTask.description"
                      placeholder="任务的简要描述"
                      :rows="2"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UFormField label="AI 角色设定" required>
                    <UTextarea
                      v-model="editTask.role"
                      placeholder="例如：你是秦桧，一个历史人物"
                      :rows="2"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UFormField label="任务目标" required>
                    <UTextarea
                      v-model="editTask.goal"
                      placeholder="例如：让 AI 给岳飞道歉"
                      :rows="2"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UFormField label="最大积分" required>
                    <UInput
                      v-model.number="editTask.maxPoints"
                      type="number"
                      min="1"
                      max="1000"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UFormField label="状态">
                    <USelectMenu
                      v-model="editTask.isActive"
                      :options="[
                        { label: '启用', value: true },
                        { label: '禁用', value: false }
                      ]"
                      class="w-full"
                    />
                  </UFormField>
                  <div class="flex items-center justify-between">
                    <UButton type="submit" :loading="submitting">
                      保存修改
                    </UButton>
                    <UButton
                      color="neutral"
                      variant="soft"
                      @click="panelMode = 'view'"
                    >
                      取消
                    </UButton>
                  </div>
                </form>

                <form v-else class="space-y-4" @submit.prevent="createTask">
                  <UFormField label="任务标题" required>
                    <UInput
                      v-model="newTask.title"
                      placeholder="例如：让 AI 道歉"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UFormField label="任务描述" required>
                    <UTextarea
                      v-model="newTask.description"
                      placeholder="任务的简要描述"
                      :rows="2"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UFormField label="AI 角色设定" required>
                    <UTextarea
                      v-model="newTask.role"
                      placeholder="例如：你是秦桧，一个历史人物"
                      :rows="2"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UFormField label="任务目标" required>
                    <UTextarea
                      v-model="newTask.goal"
                      placeholder="例如：让 AI 给岳飞道歉"
                      :rows="2"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UFormField label="最大积分" required>
                    <UInput
                      v-model.number="newTask.maxPoints"
                      type="number"
                      min="1"
                      max="1000"
                      class="w-full"
                      required
                    />
                  </UFormField>
                  <UButton type="submit" :loading="submitting">
                    创建任务
                  </UButton>
                </form>

                <template #footer>
                  <div v-if="panelMode === 'view' && selectedTask" class="flex items-center justify-between">
                    <UButton size="sm" color="primary" variant="soft" @click="beginEdit(selectedTask)">
                      进入编辑
                    </UButton>
                    <div class="flex items-center gap-2">
                      <UButton size="sm" color="error" variant="soft" @click="deleteTask(selectedTask)">
                        删除
                      </UButton>
                      <UButton size="sm" color="neutral" variant="ghost" @click="toggleTaskStatus(selectedTask)">
                        {{ selectedTask.isActive !== false ? '禁用' : '启用' }}
                      </UButton>
                    </div>
                  </div>
                </template>
              </UCard>

              <UCard
                v-if="selectedTask"
                variant="subtle"
                :ui="{ root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800' }"
              >
                <template #header>
                  <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold">用户尝试记录</h3>
                    <UBadge color="neutral" variant="soft">{{ attempts.length }}</UBadge>
                  </div>
                </template>

                <div v-if="attemptsLoading" class="flex justify-center py-6 text-gray-500 dark:text-gray-400">
                  <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
                </div>
                <div v-else-if="attempts.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
                  暂无尝试记录
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="attempt in attempts"
                    :key="attempt.id"
                    class="rounded-lg border border-gray-200 p-3 text-xs dark:border-gray-800"
                  >
                    <div class="flex items-center justify-between">
                      <div class="font-medium text-gray-900 dark:text-gray-100">
                        {{ attempt.user.username }}
                      </div>
                      <UBadge
                        :color="attempt.status === 'completed' ? 'success' : attempt.status === 'failed' ? 'error' : 'warning'"
                        variant="soft"
                        size="xs"
                      >
                        {{ attempt.status === 'completed' ? '成功' : attempt.status === 'failed' ? '失败' : '进行中' }}
                      </UBadge>
                    </div>
                    <div class="mt-2 flex flex-wrap items-center gap-2 text-gray-500 dark:text-gray-400">
                      <span>得分 {{ attempt.score ?? 0 }}</span>
                      <span>积分 {{ attempt.points }}</span>
                      <span>{{ new Date(attempt.createdAt).toLocaleString() }}</span>
                    </div>
                    <div class="mt-2 flex items-center justify-between">
                      <span class="text-gray-500 dark:text-gray-400">
                        对话 {{ attempt.conversation.length }} 条
                      </span>
                      <UButton size="xs" variant="soft" @click="selectAdminAttempt(attempt)">
                        查看对话
                      </UButton>
                    </div>
                    <div
                      v-if="selectedAdminAttempt?.id === attempt.id"
                      class="mt-3 max-h-40 overflow-y-auto rounded-md bg-gray-50 p-2 text-[11px] text-gray-600 dark:bg-gray-950 dark:text-gray-400"
                    >
                      <div v-for="(msg, idx) in attempt.conversation" :key="idx" class="mb-2">
                        <span class="font-semibold">{{ msg.role === 'user' ? '用户' : 'AI' }}：</span>
                        <span>{{ msg.content }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </UCard>
            </aside>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const tasks = ref<Array<{
  id: string
  title: string
  description: string
  role: string
  goal: string
  maxPoints: number
  isActive?: boolean
  createdAt: string
  participationCount?: number
  completedCount?: number
}>>([])
const tasksLoading = ref(true)
const submitting = ref(false)
const selectedTaskId = ref<string | null>(null)
const panelMode = ref<'view' | 'edit' | 'create'>('create')
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'disabled'>('all')
const attemptsLoading = ref(false)
const attempts = ref<Array<{
  id: string
  status: 'pending' | 'completed' | 'failed'
  points: number
  score: number | null
  feedback: string | null
  createdAt: string
  completedAt: string | null
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>
  user: { id: string; username: string }
  task: { id: string; title: string }
}>>([])
const selectedAdminAttempt = ref<(typeof attempts.value)[0] | null>(null)

const newTask = ref({
  title: '',
  description: '',
  role: '',
  goal: '',
  maxPoints: 100
})
const editTask = ref({
  id: '',
  title: '',
  description: '',
  role: '',
  goal: '',
  maxPoints: 100,
  isActive: true
})

const selectedTask = computed(() =>
  selectedTaskId.value ? tasks.value.find(t => t.id === selectedTaskId.value) ?? null : null
)

const filteredTasks = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  return tasks.value.filter(task => {
    const matchesKeyword = !keyword
      || task.title.toLowerCase().includes(keyword)
      || task.description.toLowerCase().includes(keyword)
    const matchesStatus = statusFilter.value === 'all'
      || (statusFilter.value === 'active' && task.isActive !== false)
      || (statusFilter.value === 'disabled' && task.isActive === false)
    return matchesKeyword && matchesStatus
  })
})

const totalTasks = computed(() => tasks.value.length)
const activeTasks = computed(() => tasks.value.filter(t => t.isActive !== false).length)
const completionRate = computed(() => {
  const total = tasks.value.reduce((sum, t) => sum + (t.participationCount ?? 0), 0)
  const done = tasks.value.reduce((sum, t) => sum + (t.completedCount ?? 0), 0)
  if (!total) return 0
  return Math.round((done / total) * 100)
})

onMounted(() => loadTasks())
watch(selectedTask, (task) => {
  if (task && panelMode.value !== 'create') {
    editTask.value = {
      id: task.id,
      title: task.title,
      description: task.description,
      role: task.role,
      goal: task.goal,
      maxPoints: task.maxPoints,
      isActive: task.isActive !== false
    }
  }
  if (task) {
    loadAdminAttempts()
  } else {
    attempts.value = []
    selectedAdminAttempt.value = null
  }
})

function beginCreate() {
  panelMode.value = 'create'
  selectedTaskId.value = null
}

function beginView(task: (typeof tasks.value)[0]) {
  selectedTaskId.value = task.id
  panelMode.value = 'view'
}

function beginEdit(task: (typeof tasks.value)[0]) {
  selectedTaskId.value = task.id
  panelMode.value = 'edit'
  editTask.value = {
    id: task.id,
    title: task.title,
    description: task.description,
    role: task.role,
    goal: task.goal,
    maxPoints: task.maxPoints,
    isActive: task.isActive !== false
  }
}

async function loadTasks() {
  try {
    tasksLoading.value = true
    const cookie = useCookie('auth-token')
    if (cookie.value) {
      tasks.value = await $fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${cookie.value}` }
      })
    } else {
      tasks.value = []
    }
  } catch (e) {
    console.error('加载任务失败:', e)
    tasks.value = []
  } finally {
    tasksLoading.value = false
  }
}

async function loadAdminAttempts() {
  if (!selectedTaskId.value) return
  try {
    attemptsLoading.value = true
    const cookie = useCookie('auth-token')
    if (!cookie.value) {
      attempts.value = []
      return
    }
    attempts.value = await $fetch('/api/admin/attempts', {
      headers: { Authorization: `Bearer ${cookie.value}` },
      params: { taskId: selectedTaskId.value }
    })
  } catch (e) {
    console.error('加载尝试记录失败:', e)
    attempts.value = []
  } finally {
    attemptsLoading.value = false
  }
}

function selectAdminAttempt(attempt: (typeof attempts.value)[0]) {
  selectedAdminAttempt.value = selectedAdminAttempt.value?.id === attempt.id ? null : attempt
}

async function createTask() {
  submitting.value = true
  try {
    const cookie = useCookie('auth-token')
    await $fetch('/api/tasks/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cookie.value}` },
      body: newTask.value
    })
    newTask.value = { title: '', description: '', role: '', goal: '', maxPoints: 100 }
    const toast = useToast()
    toast.add({ title: '任务创建成功！', color: 'success' })
    await loadTasks()
    panelMode.value = 'create'
  } catch (err: any) {
    const toast = useToast()
    toast.add({ title: err?.data?.message ?? '创建任务失败', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function updateTask() {
  if (!editTask.value.id) return
  submitting.value = true
  try {
    const cookie = useCookie('auth-token')
    await $fetch(`/api/tasks/${editTask.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${cookie.value}` },
      body: {
        title: editTask.value.title,
        description: editTask.value.description,
        role: editTask.value.role,
        goal: editTask.value.goal,
        maxPoints: editTask.value.maxPoints,
        isActive: editTask.value.isActive
      }
    })
    const toast = useToast()
    toast.add({ title: '任务已更新', color: 'success' })
    await loadTasks()
    panelMode.value = 'view'
  } catch (err: any) {
    const toast = useToast()
    toast.add({ title: err?.data?.message ?? '更新任务失败', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function toggleTaskStatus(task: (typeof tasks.value)[0]) {
  const nextStatus = task.isActive === false
  submitting.value = true
  try {
    const cookie = useCookie('auth-token')
    await $fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${cookie.value}` },
      body: {
        title: task.title,
        description: task.description,
        role: task.role,
        goal: task.goal,
        maxPoints: task.maxPoints,
        isActive: nextStatus
      }
    })
    const toast = useToast()
    toast.add({ title: nextStatus ? '任务已启用' : '任务已禁用', color: 'success' })
    await loadTasks()
    if (selectedTaskId.value === task.id) {
      panelMode.value = 'view'
    }
  } catch (err: any) {
    const toast = useToast()
    toast.add({ title: err?.data?.message ?? '更新状态失败', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function deleteTask(task: (typeof tasks.value)[0]) {
  if (!confirm(`确定删除任务「${task.title}」吗？此操作无法恢复。`)) return
  const currentIndex = tasks.value.findIndex(t => t.id === task.id)
  const nextTask = tasks.value[currentIndex + 1] ?? tasks.value[currentIndex - 1] ?? null
  submitting.value = true
  try {
    const cookie = useCookie('auth-token')
    await $fetch(`/api/tasks/${task.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${cookie.value}` }
    })
    const toast = useToast()
    toast.add({ title: '任务已删除', color: 'success' })
    if (selectedTaskId.value === task.id) {
      selectedTaskId.value = nextTask?.id ?? null
      panelMode.value = nextTask ? 'view' : 'create'
    }
    await loadTasks()
  } catch (err: any) {
    const toast = useToast()
    toast.add({ title: err?.data?.message ?? '删除任务失败', color: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>
