<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2 class="text-center text-lg font-semibold">
          登录 / 注册
        </h2>
      </template>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :title="error"
        class="mb-4"
      />
      <UAlert
        v-if="success"
        color="success"
        variant="soft"
        :title="success"
        class="mb-4"
      />

      <UButtonGroup class="mb-6">
        <UButton
          :color="isLogin ? 'primary' : 'neutral'"
          :variant="isLogin ? 'solid' : 'soft'"
          block
          @click="isLogin = true"
        >
          登录
        </UButton>
        <UButton
          :color="!isLogin ? 'primary' : 'neutral'"
          :variant="!isLogin ? 'solid' : 'soft'"
          block
          @click="isLogin = false"
        >
          注册
        </UButton>
      </UButtonGroup>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <UFormField label="用户名" required>
          <UInput
            v-model="username"
            placeholder="请输入用户名"
            size="lg"
            class="w-full"
            required
            minlength="3"
            maxlength="20"
          />
        </UFormField>
        <UFormField label="密码" required>
          <UInput
            v-model="password"
            type="password"
            placeholder="请输入密码"
            size="lg"
            class="w-full"
            required
            minlength="6"
          />
        </UFormField>
        <UButton
          type="submit"
          block
          size="lg"
          :loading="submitting"
        >
          {{ isLogin ? '登录' : '注册' }}
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-muted">
          <UButton
            color="primary"
            variant="link"
            size="sm"
            @click="navigateTo('/')"
          >
            返回首页
          </UButton>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { login, register } = useAuth()
const username = ref('')
const password = ref('')
const isLogin = ref(true)
const error = ref('')
const success = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    const result = isLogin.value
      ? await login(username.value, password.value)
      : await register(username.value, password.value)
    if (result.success) {
      success.value = isLogin.value ? '登录成功！' : '注册成功！'
      setTimeout(() => navigateTo('/'), 1000)
    } else {
      error.value = result.error ?? '失败'
    }
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || '操作失败'
  } finally {
    submitting.value = false
  }
}
</script>
