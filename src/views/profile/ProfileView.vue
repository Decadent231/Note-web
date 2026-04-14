<template>
  <div class="page-shell">
    <div style="margin-bottom: 18px;">
      <h1 class="page-title">个人中心</h1>
      <p class="page-subtitle">修改昵称和登录密码，账号邮箱作为唯一身份保持不变。</p>
    </div>

    <div class="split-grid">
      <div class="section-card" style="padding: 24px;">
        <div style="font-size: 22px; font-weight: 700;">基本信息</div>
        <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-position="top" style="margin-top: 16px;">
          <el-form-item label="邮箱">
            <el-input :model-value="userStore.user?.email" disabled />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="profileForm.nickname" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="profileLoading" @click="saveProfile">保存资料</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="section-card" style="padding: 24px;">
        <div style="font-size: 22px; font-weight: 700;">修改密码</div>
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-position="top" style="margin-top: 16px;">
          <el-form-item label="原密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="passwordLoading" @click="savePassword">更新密码</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const profileFormRef = ref()
const passwordFormRef = ref()
const profileLoading = ref(false)
const passwordLoading = ref(false)

const profileForm = reactive({
  nickname: userStore.user?.nickname || ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: ''
})

const profileRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少6位', trigger: 'blur' }
  ]
}

async function saveProfile() {
  await profileFormRef.value.validate()
  profileLoading.value = true
  try {
    const user = await authApi.updateProfile(profileForm)
    userStore.updateUser(user)
    ElMessage.success('资料更新成功')
  } finally {
    profileLoading.value = false
  }
}

async function savePassword() {
  await passwordFormRef.value.validate()
  passwordLoading.value = true
  try {
    await authApi.changePassword(passwordForm)
    ElMessage.success('密码修改成功，请妥善保管新密码')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
  } finally {
    passwordLoading.value = false
  }
}
</script>
