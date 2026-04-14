<template>
  <div class="auth-shell">
    <div class="auth-card glass-panel">
      <section class="auth-hero">
        <div>
          <div style="font-size: 12px; letter-spacing: 0.16em; opacity: 0.74;">ACCOUNT SETUP</div>
          <h1 style="font-size: 50px; margin: 18px 0 0;">注册你的工作空间</h1>
          <p style="margin-top: 18px; max-width: 480px; line-height: 1.8; font-size: 16px; opacity: 0.88;">
            注册完成后即可使用工作笔记、密码保险箱和待办管理。注册验证码会发送到你提供的邮箱。
          </p>
        </div>
      </section>

      <section class="auth-panel">
        <div style="max-width: 420px; margin: 0 auto;">
          <div style="font-size: 30px; font-weight: 800;">创建账号</div>
          <div class="page-subtitle" style="margin-bottom: 24px;">绑定邮箱并设置昵称与密码。</div>

          <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入昵称" size="large" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" size="large" />
            </el-form-item>
            <el-form-item label="验证码" prop="code">
              <div class="toolbar-row" style="width: 100%;">
                <el-input v-model="form.code" placeholder="请输入验证码" size="large" />
                <el-button size="large" :loading="sending" @click="sendCode">发送验证码</el-button>
              </div>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" show-password placeholder="至少6位" size="large" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" style="width: 100%;" :loading="submitting" @click="submit">
                完成注册
              </el-button>
            </el-form-item>
          </el-form>

          <div class="toolbar-row" style="justify-content: space-between;">
            <span class="page-subtitle">已经有账号？</span>
            <el-button text type="primary" @click="router.push('/login')">返回登录</el-button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'

const router = useRouter()
const formRef = ref()
const sending = ref(false)
const submitting = ref(false)

const form = reactive({
  nickname: '',
  email: '',
  code: '',
  password: ''
})

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

async function sendCode() {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  sending.value = true
  try {
    await authApi.sendCode(form.email)
    ElMessage.success('验证码已发送')
  } finally {
    sending.value = false
  }
}

async function submit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    await authApi.register(form)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } finally {
    submitting.value = false
  }
}
</script>
