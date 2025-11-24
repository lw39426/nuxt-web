<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <div class="auth-title">账号注册</div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            placeholder="请再次输入密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="onSubmit">注册</el-button>
          <el-button link @click="goLogin">已有账号？去登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuth } from '~/composables/useAuth'
import { useAuthState } from '~/composables/useAuthState'
definePageMeta({ middleware: ['guest'] })

const formRef = ref<FormInstance>()
const submitting = ref(false)
const form = reactive({ username: '', password: '', confirmPassword: '' })

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度 3-20 字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '长度 6-32 字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: (err?: Error) => void) => {
        if (value !== form.password) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

const router = useRouter()
const { register } = useAuth()
const { setAuth } = useAuthState()

/**
 * 提交注册表单
 */
const onSubmit = async () => {
  if (!formRef.value) return
  try {
    submitting.value = true
    await formRef.value.validate()
    const res = await register({
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword
    })
    ElMessage.success('注册成功')
    setAuth({ token: res.data.token, user: res.data.user })
    await router.push('/')
  } catch (e: any) {
    ElMessage.error(e?.message || '注册失败')
  } finally {
    submitting.value = false
  }
}

/**
 * 跳转到登录页面
 */
const goLogin = () => router.push('/login')
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 24px;
}
.auth-card {
  width: 420px;
}
.auth-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
</style>
