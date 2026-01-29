<template>
  <div class="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <header class="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="navigateTo('/')"
        />
        <h1 class="text-sm font-medium text-gray-900 dark:text-white">
          AI 任务对话
        </h1>
      </div>
      <UBadge color="warning" variant="soft" size="lg">
        <UIcon name="i-lucide-coins" class="mr-1" />
        {{ user?.points ?? 0 }} 积分
      </UBadge>
    </header>

    <!-- 主体内容区 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex flex-1 items-center justify-center">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
      </div>

      <!-- 任务不存在 -->
      <div v-else-if="!task" class="flex flex-1 items-center justify-center">
        <UCard class="max-w-md">
          <p class="text-center text-muted">任务不存在</p>
        </UCard>
      </div>

      <!-- 左右分栏布局 -->
      <div v-else class="flex flex-1 overflow-hidden">
        <!-- 左侧：任务信息面板 -->
        <aside class="flex w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div class="flex-1 overflow-y-auto p-6">
            <div class="space-y-6">
              <!-- 任务标题 -->
              <div>
                <div class="mb-2 flex items-center gap-2">
                  <UIcon name="i-lucide-target" class="size-5 text-primary" />
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">任务信息</h2>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ task.title }}
                </h3>
              </div>

              <!-- 任务描述 -->
              <div>
                <div class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <UIcon name="i-lucide-file-text" class="size-4" />
                  <span>描述</span>
                </div>
                <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {{ task.description }}
                </p>
              </div>

              <!-- 任务目标 -->
              <div class="rounded-lg bg-primary-50 p-4 dark:bg-primary-950/30">
                <div class="mb-2 flex items-center gap-2 text-sm font-medium text-primary-700 dark:text-primary-400">
                  <UIcon name="i-lucide-flag" class="size-4" />
                  <span>任务目标</span>
                </div>
                <p class="text-sm leading-relaxed text-primary-900 dark:text-primary-200">
                  {{ task.goal }}
                </p>
              </div>

              <!-- AI 角色 -->
              <div class="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30">
                <div class="mb-2 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                  <UIcon name="i-lucide-bot" class="size-4" />
                  <span>AI 角色</span>
                </div>
                <p class="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                  {{ task.role }}
                </p>
              </div>

              <!-- 最大积分 -->
              <div class="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                <div class="mb-2 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                  <UIcon name="i-lucide-trophy" class="size-4" />
                  <span>最大积分</span>
                </div>
                <p class="text-2xl font-bold text-green-900 dark:text-green-200">
                  {{ task.maxPoints }}
                </p>
              </div>

              <!-- 完成状态 -->
              <div v-if="completed" class="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <div class="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <UIcon name="i-lucide-check-circle" class="size-4" />
                  <span>任务已完成</span>
                </div>
                <div class="space-y-2 text-sm text-emerald-900 dark:text-emerald-200">
                  <p><strong>得分：</strong>{{ completionScore }}</p>
                  <p><strong>获得积分：</strong>{{ completionPoints }}</p>
                  <p class="text-xs leading-relaxed">{{ completionFeedback }}</p>
                </div>
              </div>

              <!-- 历史尝试记录 -->
              <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div class="mb-3 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <UIcon name="i-lucide-history" class="size-4" />
                    <span>历史尝试</span>
                  </div>
                  <UButton size="xs" color="primary" variant="soft" @click="startNewAttempt">
                    开始新尝试
                  </UButton>
                </div>

                <div v-if="attemptsLoading" class="flex justify-center py-4 text-gray-500 dark:text-gray-400">
                  <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
                </div>
                <div v-else-if="attempts.length === 0" class="text-xs text-gray-500 dark:text-gray-400">
                  暂无记录
                </div>
                <div v-else class="space-y-2">
                  <button
                    v-for="attempt in attempts"
                    :key="attempt.id"
                    type="button"
                    class="w-full rounded-lg border border-transparent px-3 py-2 text-left text-xs transition hover:bg-gray-50 dark:hover:bg-gray-900"
                    :class="attemptId === attempt.id ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-950/30' : ''"
                    @click="selectAttempt(attempt)"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-gray-900 dark:text-gray-100">
                        第 {{ attempts.length - attempts.indexOf(attempt) }} 次尝试
                      </span>
                      <UBadge
                        :color="attempt.status === 'completed' ? 'success' : attempt.status === 'failed' ? 'error' : 'warning'"
                        variant="soft"
                        size="xs"
                      >
                        {{ attempt.status === 'completed' ? '成功' : attempt.status === 'failed' ? '失败' : '进行中' }}
                      </UBadge>
                    </div>
                    <div class="mt-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <span>{{ new Date(attempt.createdAt).toLocaleString() }}</span>
                      <span v-if="attempt.score !== null">得分 {{ attempt.score }} · 积分 {{ attempt.points }}</span>
                      <span v-else>未评估</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 右侧：对话区域 -->
        <main class="flex flex-1 flex-col bg-gray-50 dark:bg-gray-900">
          <!-- 对话消息区 -->
          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto px-4 py-6"
          >
            <div class="w-full">
              <!-- 空状态提示 -->
              <div v-if="conversation.length === 0" class="mx-auto flex min-h-[420px] max-w-3xl flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                <UIcon name="i-lucide-message-circle" class="mb-4 size-16 opacity-50" />
                <p class="text-lg font-medium">开始与 AI 对话吧！</p>
                <p class="mt-2 text-sm">提示：你需要通过对话达成任务目标</p>
              </div>

              <!-- 对话消息列表（ChatGPT 风格） -->
              <div>
                <div
                  v-for="(msg, index) in conversation"
                  :key="index"
                  :class="[
                    'border-b border-gray-200/70 dark:border-gray-800/70',
                    msg.role === 'user' ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'
                  ]"
                >
                  <div class="mx-auto flex max-w-3xl gap-3 px-4 py-5">
                    <div
                      :class="[
                        'flex size-8 items-center justify-center rounded-full',
                        msg.role === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                      ]"
                    >
                      <UIcon :name="msg.role === 'user' ? 'i-lucide-user' : 'i-lucide-bot'" class="size-4" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {{ msg.role === 'user' ? '你' : 'AI' }}
                      </div>
                      <div class="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                        {{ msg.content }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- AI 加载状态 -->
                <div v-if="aiLoading" class="border-b border-gray-200/70 bg-gray-50 dark:border-gray-800/70 dark:bg-gray-900">
                  <div class="mx-auto flex max-w-3xl gap-3 px-4 py-5">
                    <div class="flex size-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      <UIcon name="i-lucide-bot" class="size-4" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">AI</div>
                      <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
                        思考中...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <div class="mx-auto max-w-3xl px-4 py-4">
              <div v-if="!completed" class="space-y-2">
                <!-- 输入框容器 -->
                <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div class="flex items-end gap-2 p-3">
                    <UTextarea
                      v-model="message"
                      placeholder="输入消息...（Enter 发送，Shift+Enter 换行）"
                      :rows="1"
                      autoresize
                      :maxrows="8"
                      :disabled="aiLoading"
                      class="flex-1"
                      :ui="{
                        wrapper: 'relative',
                        base: 'text-base pr-12',
                        padding: { default: 'px-3 py-2' }
                      }"
                      @keydown.enter.exact.prevent="sendMessage"
                    />
                    <UButton
                      icon="i-lucide-send"
                      color="primary"
                      size="lg"
                      :disabled="aiLoading || !message.trim()"
                      :ui="{ rounded: 'rounded-xl' }"
                      @click="sendMessage"
                    />
                  </div>
                </div>

                <!-- 底部提示与操作 -->
                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Enter 发送，Shift+Enter 换行</span>
                  <UButton
                    icon="i-lucide-check-circle"
                    color="success"
                    variant="soft"
                    size="xs"
                    :disabled="aiLoading || conversation.length === 0"
                    @click="completeTask"
                  >
                    完成任务
                  </UButton>
                </div>
              </div>

              <!-- 任务完成状态 -->
              <div v-else class="flex items-center justify-between py-2">
                <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <UIcon name="i-lucide-check-circle-2" class="size-5 text-green-500" />
                  <span class="font-medium">任务已完成</span>
                </div>
                <UButton
                  icon="i-lucide-arrow-left"
                  color="neutral"
                  variant="soft"
                  size="sm"
                  @click="navigateTo('/')"
                >
                  返回任务列表
                </UButton>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user } = useAuth()
const taskId = route.params.id as string

const task = ref<{
  id: string
  title: string
  description: string
  role: string
  goal: string
  maxPoints: number
} | null>(null)
const loading = ref(true)
const conversation = ref<Array<{ role: 'user' | 'assistant'; content: string }>>([])
const message = ref('')
const aiLoading = ref(false)
const completed = ref(false)
const completionScore = ref(0)
const completionPoints = ref(0)
const completionFeedback = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const attemptId = ref<string | null>(null)
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
}>>([])

onMounted(async () => {
  await loadTask()
  if (user.value) {
    await loadAttempts()
  }
})

async function loadTask() {
  try {
    loading.value = true
    task.value = await $fetch(`/api/tasks/${taskId}`)
  } catch (e) {
    console.error('加载任务失败:', e)
  } finally {
    loading.value = false
  }
}

async function loadAttempts() {
  try {
    attemptsLoading.value = true
    const cookie = useCookie('auth-token')
    if (!cookie.value) {
      attempts.value = []
      return
    }
    attempts.value = await $fetch(`/api/tasks/${taskId}/attempts`, {
      headers: { Authorization: `Bearer ${cookie.value}` }
    })
  } catch (e) {
    console.error('加载尝试记录失败:', e)
  } finally {
    attemptsLoading.value = false
  }
}

function selectAttempt(attempt: (typeof attempts.value)[0]) {
  attemptId.value = attempt.id
  conversation.value = attempt.conversation ?? []
  completed.value = attempt.status !== 'pending'
  completionScore.value = attempt.score ?? 0
  completionPoints.value = attempt.points ?? 0
  completionFeedback.value = attempt.feedback ?? ''
  scrollToBottom()
}

function startNewAttempt() {
  attemptId.value = null
  conversation.value = []
  completed.value = false
  completionScore.value = 0
  completionPoints.value = 0
  completionFeedback.value = ''
}

async function sendMessage() {
  if (!message.value.trim() || aiLoading.value) return
  const userMessage = message.value.trim()
  message.value = ''
  aiLoading.value = true
  try {
    const cookie = useCookie('auth-token')
    const response = await $fetch<{ conversation: typeof conversation.value; attemptId: string }>(`/api/tasks/${taskId}/chat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cookie.value}` },
      body: { message: userMessage, conversation: conversation.value, attemptId: attemptId.value }
    })
    conversation.value = response.conversation
    attemptId.value = response.attemptId
    scrollToBottom()
    await loadAttempts()
  } catch (err: any) {
    const toast = useToast()
    toast.add({ title: err?.data?.message ?? '发送消息失败', color: 'error' })
  } finally {
    aiLoading.value = false
  }
}

async function completeTask() {
  if (conversation.value.length === 0) {
    const toast = useToast()
    toast.add({ title: '请先与 AI 对话', color: 'warning' })
    return
  }
  if (!confirm('确定提交任务吗？提交后将无法继续对话。')) return
  aiLoading.value = true
  try {
    const cookie = useCookie('auth-token')
    const response = await $fetch<{ score: number; points: number; feedback: string }>(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cookie.value}` },
      body: { conversation: conversation.value, attemptId: attemptId.value }
    })
    completed.value = true
    completionScore.value = response.score
    completionPoints.value = response.points
    completionFeedback.value = response.feedback
    if (user.value) user.value.points += response.points
    attemptId.value = null
    await loadAttempts()
    scrollToBottom()
  } catch (err: any) {
    const toast = useToast()
    toast.add({ title: err?.data?.message ?? '提交任务失败', color: 'error' })
  } finally {
    aiLoading.value = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value)
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  })
}

watch(conversation, () => scrollToBottom())
</script>
