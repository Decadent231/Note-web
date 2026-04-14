<template>
  <div class="page-shell">
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

    <div class="section-card" style="padding: 18px;">
      <el-row :gutter="18">
        <el-col v-for="item in tableData" :key="item.id" :xs="24" :sm="12" :lg="8">
          <div class="metric-card" style="margin-bottom: 18px;">
            <div class="toolbar-row" style="justify-content: space-between;">
              <div style="font-weight: 800; font-size: 18px;">{{ item.title }}</div>
              <el-tag>{{ item.category || '未分类' }}</el-tag>
            </div>
            <div class="page-subtitle" style="margin-top: 10px;">账号：{{ item.username || '-' }}</div>
            <div class="page-subtitle">
              网址：
              <template v-if="item.website">
                <a
                  :href="normalizeWebsite(item.website)"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="color: var(--app-accent-2); text-decoration: underline;"
                >
                  {{ item.website }}
                </a>
              </template>
              <template v-else>-</template>
            </div>
            <div style="margin-top: 16px;" class="vault-secret">
              <el-input :type="visibleIds.includes(item.id) ? 'text' : 'password'" :model-value="item.password" readonly />
              <el-button @click="toggleSecret(item.id)">{{ visibleIds.includes(item.id) ? '隐藏' : '显示' }}</el-button>
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
            <el-input v-model="form.password" show-password />
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
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { noteApi } from '@/api/note'

const formRef = ref()
const dialogVisible = ref(false)
const submitting = ref(false)
const visibleIds = ref([])
const tableData = ref([])
const query = reactive({ keyword: '', category: '' })
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

onMounted(loadData)
</script>
