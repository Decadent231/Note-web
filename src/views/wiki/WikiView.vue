<template>
  <div class="page-shell wiki-page-shell">
    <div class="toolbar-row page-action-row">
      <div>
        <h1 class="page-title">知识库</h1>
        <p class="page-subtitle">构建你的个人知识体系，树形目录管理文档</p>
      </div>
      <el-button type="primary" size="large" @click="openSpaceDialog()">新建知识库</el-button>
    </div>

    <div class="space-grid">
      <div
        v-for="space in spaces"
        :key="space.id"
        class="section-card space-card"
        @click="enterSpace(space)"
      >
        <div class="space-icon">{{ space.icon || '📋' }}</div>
        <div class="space-name">{{ space.name }}</div>
        <div class="space-desc">{{ space.description || '暂无描述' }}</div>
        <div class="space-actions">
          <el-button text type="primary" size="small" @click.stop="openSpaceDialog(space)">编辑</el-button>
          <el-button text type="danger" size="small" @click.stop="removeSpace(space.id)">删除</el-button>
        </div>
      </div>
      <el-empty v-if="spaces.length === 0" description="暂无知识库，点击右上角创建" style="grid-column: 1 / -1;" />
    </div>

    <el-dialog v-model="spaceDialogVisible" :title="spaceForm.id ? '编辑知识库' : '新建知识库'" width="440px" destroy-on-close>
      <el-form ref="spaceFormRef" :model="spaceForm" :rules="spaceRules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="spaceForm.name" placeholder="知识库名称" />
        </el-form-item>
        <el-form-item label="图标">
          <div class="icon-picker-row">
            <div
              v-for="ic in iconOptions"
              :key="ic"
              class="icon-dot"
              :class="{ active: spaceForm.icon === ic }"
              @click="spaceForm.icon = ic"
            >{{ ic }}</div>
          </div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="spaceForm.description" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="spaceDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitSpace">{{ spaceForm.id ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { noteApi } from '@/api/note'

const router = useRouter()

const spaces = ref([])
const spaceDialogVisible = ref(false)
const submitting = ref(false)
const spaceFormRef = ref(null)

const iconOptions = ['📋', '📚', '📝', '💡', '🔬', '💻', '🎯', '📊', '🏗️', '🎨', '📖', '🔧']

const spaceForm = reactive({ id: null, name: '', icon: '📋', description: '' })
const spaceRules = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }

async function loadSpaces() {
  const res = await noteApi.listWikiSpaces()
  spaces.value = res || []
}

function enterSpace(space) {
  router.push(`/wiki/${space.id}`)
}

function openSpaceDialog(space) {
  if (space) {
    Object.assign(spaceForm, { id: space.id, name: space.name, icon: space.icon || '📋', description: space.description || '' })
  } else {
    Object.assign(spaceForm, { id: null, name: '', icon: '📋', description: '' })
  }
  spaceDialogVisible.value = true
}

async function submitSpace() {
  await spaceFormRef.value.validate()
  submitting.value = true
  try {
    const payload = { name: spaceForm.name, icon: spaceForm.icon, description: spaceForm.description || null }
    if (spaceForm.id) {
      await noteApi.updateWikiSpace(spaceForm.id, payload)
      ElMessage.success('已更新')
    } else {
      await noteApi.createWikiSpace(payload)
      ElMessage.success('已创建')
    }
    spaceDialogVisible.value = false
    await loadSpaces()
  } finally {
    submitting.value = false
  }
}

async function removeSpace(id) {
  await ElMessageBox.confirm('删除知识库将同时删除其中所有页面，确定吗？', '删除确认', { type: 'warning' })
  await noteApi.deleteWikiSpace(id)
  ElMessage.success('已删除')
  await loadSpaces()
}

onMounted(loadSpaces)
</script>

<style scoped>
.wiki-page-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.page-action-row {
  justify-content: space-between;
  margin-bottom: 18px;
}

.space-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.space-card {
  padding: 24px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.space-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.space-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.space-name {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 6px;
}

.space-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 14px;
  min-height: 18px;
}

.space-actions {
  display: flex;
  gap: 4px;
}

.icon-picker-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.icon-dot {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.12s, box-shadow 0.12s;
  border: 2px solid transparent;
}

.icon-dot:hover {
  background: var(--el-fill-color);
}

.icon-dot.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

@media (max-width: 768px) {
  .page-action-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .space-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .space-card {
    padding: 18px;
  }
}
</style>
