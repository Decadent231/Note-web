<template>
  <div class="auth-shell">
    <div class="auth-card glass-panel">
      <section class="auth-hero">
        <div>
          <div style="font-size: 12px; letter-spacing: 0.16em; opacity: 0.74;">WORK SYSTEM</div>
          <h1 style="font-size: 52px; margin: 18px 0 0;">工作笔记与个人效率管理系统</h1>
          <p style="margin-top: 18px; max-width: 480px; line-height: 1.8; font-size: 16px; opacity: 0.88;">
            把工作笔记、账号密码和待办任务收进同一个空间。页面采用响应式布局，支持深浅主题切换，并直接连接你阿里云上的微服务接口。
          </p>
        </div>
        <div class="metric-grid">
          <div class="metric-card" style="background: rgba(255,255,255,0.12); color: white;">
            <div class="metric-label" style="color: rgba(255,255,255,0.72);">笔记系统</div>
            <div class="metric-value">Rich</div>
          </div>
          <div class="metric-card" style="background: rgba(255,255,255,0.12); color: white;">
            <div class="metric-label" style="color: rgba(255,255,255,0.72);">保险箱</div>
            <div class="metric-value">AES</div>
          </div>
          <div class="metric-card" style="background: rgba(255,255,255,0.12); color: white;">
            <div class="metric-label" style="color: rgba(255,255,255,0.72);">待办</div>
            <div class="metric-value">TODO</div>
          </div>
          <div class="metric-card" style="background: rgba(255,255,255,0.12); color: white;">
            <div class="metric-label" style="color: rgba(255,255,255,0.72);">后端</div>
            <div class="metric-value">Cloud</div>
          </div>
        </div>
      </section>

      <section class="auth-panel">
        <div style="max-width: 420px; margin: 0 auto;">
          <div style="font-size: 30px; font-weight: 800;">欢迎回来</div>
          <div class="page-subtitle" style="margin-bottom: 24px;">请输入邮箱和密码登录系统。</div>

          <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入注册邮箱" size="large" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" style="width: 100%;" :loading="loading" @click="submit">
                登录系统
              </el-button>
            </el-form-item>
          </el-form>

          <div class="toolbar-row" style="justify-content: space-between;">
            <span class="page-subtitle">还没有账号？</span>
            <el-button text type="primary" @click="router.push('/register')">去注册</el-button>
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
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await userStore.login(form)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}
</script>
