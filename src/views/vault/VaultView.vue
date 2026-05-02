<template>
  <div class="page-shell vault-page-shell">
    <div v-if="!vaultUnlocked" class="vault-gate">
      <div class="vault-gate-card section-card" style="padding: 40px 36px; max-width: 420px; width: 100%;">
        <div style="text-align: center; margin-bottom: 24px;">
          <el-icon style="font-size: 48px; color: var(--app-accent-2);"><Lock /></el-icon>
          <div style="font-size: 22px; font-weight: 800; margin-top: 16px;">保险箱已锁定</div>
          <p class="page-subtitle" style="margin-top: 8px;">请输入登录密码以访问保险箱数据</p>
        </div>
        <el-form @submit.prevent="unlockVault">
          <el-form-item>
            <el-input
              v-model="unlockPassword"
              type="password"
              show-password
              placeholder="请输入您的登录密码"
              size="large"
              @keyup.enter="unlockVault"
            />
          </el-form-item>
          <el-button type="primary" size="large" style="width: 100%;" :loading="unlocking" @click="unlockVault">解锁保险箱</el-button>
        </el-form>
      </div>
    </div>

    <template v-else>
      <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 18px;">
        <div>
          <h1 class="page-title">账号密码保险箱</h1>
          <p class="page-subtitle">敏感密码由后端加密存储，这里只负责安全展示与分类管理。</p>
        </div>
        <el-button type="primary" size="large" @click="openCreate">新增记录</el-button>
      </div>

      <div class="section-card" style="padding: 18px; margin-bottom: 18px;">
        <div class="toolbar-row">
          <el-input v-model="query.keyword" placeholder="搜索标题 / 账号 / 网址 / 备注" clearable style="max-width: 280px;" />
          <el-input v-model="query.category" placeholder="分类" clearable style="max-width: 180px;" />
          <el-button @click="loadData">查询</el-button>
        </div>
      </div>

      <div class="section-card vault-list-card">
        <el-row :gutter="18" class="vault-list-grid scrollbar-hidden">
          <el-col v-for="item in tableData" :key="item.id" :xs="24" :sm="12" :lg="8">
            <div class="metric-card" style="margin-bottom: 18px;">
              <div class="toolbar-row" style="justify-content: space-between;">
                <div style="font-weight: 800; font-size: 18px;">{{ item.title }}</div>
                <el-tag>{{ item.category || '未分类' }}</el-tag>
              </div>
              <div class="page-subtitle" style="margin-top: 10px;">账号：{{ item.username || '-' }}</div>
              <div class="page-subtitle vault-website-row">
                网址：
                <template v-if="item.website">
                  <a
                    :href="normalizeWebsite(item.website)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="vault-website-link"
                  >
                    {{ item.website }}
                  </a>
                </template>
                <template v-else>-</template>
              </div>
              <div style="margin-top: 16px;" class="vault-secret">
                <el-input :type="visibleIds.includes(item.id) ? 'text' : 'password'" :model-value="item.password" readonly />
                <el-button @click="toggleSecret(item.id)">{{ visibleIds.includes(item.id) ? '隐藏' : '显示' }}</el-button>
                <el-dropdown trigger="click" @command="(cmd) => copyText(cmd === 'username' ? item.username : item.password)">
                  <el-button>复制</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="username" :disabled="!item.username">复制账号</el-dropdown-item>
                      <el-dropdown-item command="password">复制密码</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div style="margin-top: 12px; line-height: 1.7;">{{ item.remark || '暂无备注' }}</div>
              <div class="toolbar-row" style="justify-content: flex-end; margin-top: 16px;">
                <el-button text type="primary" @click="editItem(item)">编辑</el-button>
                <el-button text type="danger" @click="removeItem(item.id)">删除</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-empty v-if="tableData.length === 0" description="还没有保险箱记录" />
      </div>

      <el-dialog v-model="dialogVisible" :title="form.id ? '编辑保险箱' : '新增保险箱'" width="640px">
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
          <div class="toolbar-row">
            <el-form-item label="标题" prop="title" style="flex: 1;">
              <el-input v-model="form.title" />
            </el-form-item>
            <el-form-item label="分类" style="width: 180px;">
              <el-input v-model="form.category" />
            </el-form-item>
          </div>
          <div class="toolbar-row">
            <el-form-item label="账号" style="flex: 1;">
              <el-input v-model="form.username" />
            </el-form-item>
            <el-form-item label="密码" prop="password" style="flex: 1;">
              <div style="display: flex; gap: 8px; width: 100%;">
                <el-input v-model="form.password" show-password style="flex: 1;" />
                <el-button @click="showGenerator = true" :icon="RefreshRight">生成</el-button>
              </div>
            </el-form-item>
          </div>
          <el-form-item label="网址">
            <el-input v-model="form.website" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="4" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="showGenerator" title="密码生成器" width="440px">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <el-input :model-value="generatedPassword" readonly size="large" style="flex: 1; font-family: monospace; font-size: 16px;" />
            <el-button size="large" @click="generatePassword">刷新</el-button>
          </div>
          <div>
            <span style="font-size: 14px;">密码长度：{{ genConfig.length }}</span>
            <el-slider v-model="genConfig.length" :min="8" :max="64" :step="1" style="margin-top: 8px;" />
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 16px;">
            <el-checkbox v-model="genConfig.uppercase">大写字母 (A-Z)</el-checkbox>
            <el-checkbox v-model="genConfig.lowercase">小写字母 (a-z)</el-checkbox>
            <el-checkbox v-model="genConfig.numbers">数字 (0-9)</el-checkbox>
            <el-checkbox v-model="genConfig.symbols">特殊符号 (!@#$...)</el-checkbox>
          </div>
        </div>
        <template #footer>
          <el-button @click="showGenerator = false">取消</el-button>
          <el-button type="primary" @click="useGenerated">使用此密码</el-button>
          <el-button @click="copyText(generatedPassword)">复制</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { Lock, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { noteApi } from '@/api/note'
import { authApi } from '@/api/auth'

const formRef = ref()
const dialogVisible = ref(false)
const submitting = ref(false)
const visibleIds = ref([])
const tableData = ref([])
const query = reactive({ keyword: '', category: '' })

const vaultUnlocked = ref(false)
const unlockPassword = ref('')
const unlocking = ref(false)

const showGenerator = ref(false)
const generatedPassword = ref('')
const genConfig = reactive({
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true
})

const form = reactive({
  id: null,
  title: '',
  category: '',
  username: '',
  password: '',
  website: '',
  remark: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

watch(showGenerator, (val) => {
  if (val) generatePassword()
})

async function unlockVault() {
  if (!unlockPassword.value) {
    ElMessage.warning('请输入密码')
    return
  }
  unlocking.value = true
  try {
    const result = await authApi.verifyPassword(unlockPassword.value)
    if (result === true || result?.data === true) {
      vaultUnlocked.value = true
      unlockPassword.value = ''
      await loadData()
    } else {
      ElMessage.error('密码不正确')
    }
  } catch (e) {
    ElMessage.error('验证失败：' + (e.message || '密码不正确'))
  } finally {
    unlocking.value = false
  }
}

function generatePassword() {
  const chars = []
  if (genConfig.uppercase) chars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  if (genConfig.lowercase) chars.push('abcdefghijklmnopqrstuvwxyz')
  if (genConfig.numbers) chars.push('0123456789')
  if (genConfig.symbols) chars.push('!@#$%^&*()_+-=[]{}|;:,.<>?')
  const pool = chars.join('')
  if (!pool) {
    generatedPassword.value = ''
    return
  }
  const arr = new Uint32Array(genConfig.length)
  crypto.getRandomValues(arr)
  generatedPassword.value = Array.from(arr, (v) => pool[v % pool.length]).join('')
}

function useGenerated() {
  form.password = generatedPassword.value
  showGenerator.value = false
  ElMessage.success('已填入生成的密码')
}

function toggleSecret(id) {
  if (visibleIds.value.includes(id)) {
    visibleIds.value = visibleIds.value.filter((item) => item !== id)
  } else {
    visibleIds.value = [...visibleIds.value, id]
  }
}

function normalizeWebsite(value) {
  if (!value) return '#'
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

async function copyText(text) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

function resetForm() {
  Object.assign(form, { id: null, title: '', category: '', username: '', password: '', website: '', remark: '' })
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function editItem(item) {
  Object.assign(form, item)
  dialogVisible.value = true
}

async function loadData() {
  tableData.value = await noteApi.listVaultItems(query)
}

async function submit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = { ...form }
    delete payload.id
    if (form.id) {
      await noteApi.updateVaultItem(form.id, payload)
      ElMessage.success('保险箱记录已更新')
    } else {
      await noteApi.createVaultItem(payload)
      ElMessage.success('保险箱记录已创建')
    }
    dialogVisible.value = false
    await loadData()
  } finally {
    submitting.value = false
  }
}

async function removeItem(id) {
  await ElMessageBox.confirm('确定删除这条保险箱记录吗？', '删除确认', { type: 'warning' })
  await noteApi.deleteVaultItem(id)
  ElMessage.success('删除成功')
  await loadData()
}

onMounted(() => {})
</script>

<style scoped>
.vault-page-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.vault-gate {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
}

.vault-list-card {
  flex: 1;
  min-height: 0;
  padding: 18px;
  overflow: hidden;
}

.vault-list-grid {
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding-right: 6px;
  align-content: start;
}

.vault-website-row {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

.vault-website-link {
  color: var(--app-accent-2);
  text-decoration: underline;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

@media (max-width: 1100px) {
  .vault-page-shell {
    overflow: auto;
  }

  .vault-list-card {
    overflow: visible;
  }

  .vault-list-grid {
    height: auto;
    overflow: visible;
  }
}

@media (max-width: 768px) {
  .vault-page-shell :deep(.toolbar-row) {
    flex-direction: column;
    align-items: stretch;
  }

  .vault-page-shell :deep(.toolbar-row[style*="justify-content: space-between"]) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .vault-page-shell :deep(.el-input[style*="max-width"]) {
    max-width: 100% !important;
  }

  .vault-secret {
    flex-wrap: wrap;
  }

  .vault-secret :deep(.el-input) {
    flex: 1;
    min-width: 120px;
  }

  .vault-gate-card {
    max-width: 100% !important;
    padding: 24px 20px !important;
  }
}
</style>
