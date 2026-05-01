<template>
  <div class="page-shell wiki-page-shell">
    <template v-if="!currentSpace">
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
    </template>

    <template v-else>
      <div class="wiki-workspace">
        <div class="wiki-sidebar">
          <div class="wiki-sidebar-head">
            <el-button text @click="exitSpace" style="margin-bottom: 8px;">
              <el-icon><ArrowLeft /></el-icon>
              <span style="margin-left: 4px;">返回</span>
            </el-button>
            <div class="wiki-space-title">
              <span>{{ currentSpace.icon }}</span>
              <span>{{ currentSpace.name }}</span>
            </div>
            <el-button text type="primary" size="small" @click="openPageDialog(null)">+ 新页面</el-button>
          </div>

          <div class="wiki-tree scrollbar-hidden">
            <div v-if="pageTree.length === 0" class="wiki-tree-empty">暂无页面</div>
            <template v-for="node in pageTree" :key="node.id">
              <div class="tree-node">
                <div
                  class="tree-row"
                  :class="{ active: currentPage?.id === node.id }"
                  @click="loadPage(node.id)"
                >
                  <span class="tree-expand" v-if="node.children && node.children.length > 0" @click.stop="toggleExpand(node.id)">
                    <el-icon v-if="expanded[node.id]"><ArrowDown /></el-icon>
                    <el-icon v-else><ArrowRight /></el-icon>
                  </span>
                  <span v-else class="tree-expand-placeholder"></span>
                  <span class="tree-label">{{ node.title }}</span>
                  <span class="tree-actions">
                    <el-button text size="small" @click.stop="openPageDialog(null, node.id)">+</el-button>
                    <el-button text size="small" type="danger" @click.stop="removePage(node.id)">×</el-button>
                  </span>
                </div>
                <template v-if="expanded[node.id] && node.children">
                  <div v-for="child in node.children" :key="child.id">
                    <div
                      class="tree-row child"
                      :class="{ active: currentPage?.id === child.id }"
                      @click="loadPage(child.id)"
                    >
                      <span class="tree-expand-placeholder"></span>
                      <span class="tree-label">{{ child.title }}</span>
                      <span class="tree-actions">
                        <el-button text size="small" @click.stop="openPageDialog(null, child.id)">+</el-button>
                        <el-button text size="small" type="danger" @click.stop="removePage(child.id)">×</el-button>
                      </span>
                    </div>
                    <template v-if="expanded[child.id] && child.children">
                      <div v-for="gchild in child.children" :key="gchild.id">
                        <div
                          class="tree-row grandchild"
                          :class="{ active: currentPage?.id === gchild.id }"
                          @click="loadPage(gchild.id)"
                        >
                          <span class="tree-expand-placeholder"></span>
                          <span class="tree-label">{{ gchild.title }}</span>
                          <span class="tree-actions">
                            <el-button text size="small" type="danger" @click.stop="removePage(gchild.id)">×</el-button>
                          </span>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>

        <div class="wiki-editor">
          <template v-if="currentPage">
            <div class="wiki-editor-head">
              <div class="wiki-editor-title-input">
                <el-input
                  v-model="editTitle"
                  placeholder="页面标题"
                  size="large"
                  class="title-input"
                  @blur="saveTitle"
                />
              </div>
              <div class="toolbar-row" style="gap: 8px;">
                <el-button text @click="openPageDialog(currentPage)">编辑信息</el-button>
                <el-tag type="info" size="small">{{ currentPage.updatedAt ? formatDate(currentPage.updatedAt) : '' }}</el-tag>
              </div>
            </div>
            <div class="wiki-editor-body">
              <el-input
                v-model="editContent"
                type="textarea"
                :autosize="false"
                placeholder="在这里书写内容，支持自由文本..."
                class="wiki-textarea"
                @input="debouncedSave"
              />
            </div>
          </template>
          <template v-else>
            <div class="wiki-editor-empty">
              <el-icon :size="48" color="var(--el-text-color-placeholder)"><Collection /></el-icon>
              <p>从左侧目录选择页面，或创建新页面开始书写</p>
            </div>
          </template>
        </div>
      </div>
    </template>

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

    <el-dialog v-model="pageDialogVisible" :title="pageForm.id ? '编辑页面' : '新建页面'" width="440px" destroy-on-close>
      <el-form ref="pageFormRef" :model="pageForm" :rules="pageRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="pageForm.title" placeholder="页面标题" />
        </el-form-item>
        <el-form-item label="父页面">
          <el-select v-model="pageForm.parentId" clearable placeholder="无（顶级页面）" style="width: 100%;">
            <el-option :label="'无（顶级页面）'" :value="null" />
            <el-option v-for="p in flatPages" :key="p.id" :label="p.title" :value="p.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pageDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitPage">{{ pageForm.id ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, ArrowLeft, ArrowRight, Collection } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { noteApi } from '@/api/note'

const route = useRoute()
const router = useRouter()

const spaces = ref([])
const currentSpace = ref(null)
const pageTree = ref([])
const flatPages = ref([])
const currentPage = ref(null)
const editTitle = ref('')
const editContent = ref('')
const expanded = reactive({})

const spaceDialogVisible = ref(false)
const pageDialogVisible = ref(false)
const submitting = ref(false)
const spaceFormRef = ref(null)
const pageFormRef = ref(null)

const iconOptions = ['📋', '📚', '📝', '💡', '🔬', '💻', '🎯', '📊', '🏗️', '🎨', '📖', '🔧']

const spaceForm = reactive({ id: null, name: '', icon: '📋', description: '' })
const pageForm = reactive({ id: null, title: '', parentId: null })

const spaceRules = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }
const pageRules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }] }

function formatDate(val) {
  return dayjs(val).format('MM-DD HH:mm')
}

async function loadSpaces() {
  const res = await noteApi.listWikiSpaces()
  spaces.value = res || []
}

async function enterSpace(space) {
  currentSpace.value = space
  router.replace(`/wiki/${space.id}`)
  await loadTree()
}

function exitSpace() {
  currentSpace.value = null
  currentPage.value = null
  router.replace('/wiki')
}

async function loadTree() {
  if (!currentSpace.value) return
  const treeRes = await noteApi.getWikiPageTree(currentSpace.value.id)
  pageTree.value = treeRes || []
  const flatRes = await noteApi.listWikiPages(currentSpace.value.id)
  flatPages.value = flatRes || []
}

function toggleExpand(id) {
  expanded[id] = !expanded[id]
}

async function loadPage(id) {
  const res = await noteApi.getWikiPage(id)
  currentPage.value = res
  editTitle.value = res.title
  editContent.value = res.content || ''
}

let saveTimer = null
function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    if (!currentPage.value) return
    await noteApi.updateWikiPage(currentPage.value.id, { content: editContent.value })
  }, 800)
}

async function saveTitle() {
  if (!currentPage.value || !editTitle.value.trim()) return
  if (editTitle.value === currentPage.value.title) return
  await noteApi.updateWikiPage(currentPage.value.id, { title: editTitle.value.trim() })
  currentPage.value.title = editTitle.value.trim()
  await loadTree()
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
  if (currentSpace.value?.id === id) exitSpace()
  await loadSpaces()
}

function openPageDialog(page, parentId) {
  if (page && page.id) {
    Object.assign(pageForm, { id: page.id, title: page.title, parentId: page.parentId || null })
  } else {
    Object.assign(pageForm, { id: null, title: '', parentId: parentId || null })
  }
  pageDialogVisible.value = true
}

async function submitPage() {
  await pageFormRef.value.validate()
  submitting.value = true
  try {
    const payload = { title: pageForm.title, spaceId: currentSpace.value.id, parentId: pageForm.parentId || null }
    if (pageForm.id) {
      await noteApi.updateWikiPage(pageForm.id, { title: pageForm.title, parentId: pageForm.parentId || null })
      ElMessage.success('已更新')
      if (currentPage.value?.id === pageForm.id) {
        currentPage.value.title = pageForm.title
        editTitle.value = pageForm.title
      }
    } else {
      const res = await noteApi.createWikiPage(payload)
      ElMessage.success('已创建')
      await loadPage(res.id)
    }
    pageDialogVisible.value = false
    await loadTree()
  } finally {
    submitting.value = false
  }
}

async function removePage(id) {
  await ElMessageBox.confirm('删除页面将同时删除子页面，确定吗？', '删除确认', { type: 'warning' })
  await noteApi.deleteWikiPage(id)
  ElMessage.success('已删除')
  if (currentPage.value?.id === id) {
    currentPage.value = null
    editTitle.value = ''
    editContent.value = ''
  }
  await loadTree()
}

onMounted(async () => {
  await loadSpaces()
  const spaceId = route.params.spaceId
  if (spaceId) {
    const space = spaces.value.find(s => s.id === Number(spaceId))
    if (space) {
      await enterSpace(space)
    }
  }
})
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

.wiki-workspace {
  display: grid;
  grid-template-columns: 280px 1fr;
  flex: 1;
  min-height: 0;
  gap: 0;
}

.wiki-sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--app-panel-strong, var(--el-bg-color));
  overflow: hidden;
}

.wiki-sidebar-head {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.wiki-space-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 10px;
}

.wiki-tree {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px;
}

.wiki-tree-empty {
  color: var(--el-text-color-placeholder);
  text-align: center;
  padding: 40px 16px;
  font-size: 14px;
}

.tree-node {
  margin-bottom: 2px;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
  font-size: 14px;
}

.tree-row:hover {
  background: var(--el-fill-color-light);
}

.tree-row.active {
  background: rgba(56, 189, 248, 0.14);
  font-weight: 700;
}

.tree-row.child {
  padding-left: 28px;
}

.tree-row.grandchild {
  padding-left: 48px;
}

.tree-expand {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.tree-expand-placeholder {
  width: 18px;
  flex-shrink: 0;
}

.tree-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-actions {
  display: none;
  gap: 0;
}

.tree-row:hover .tree-actions {
  display: flex;
}

.wiki-editor {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.wiki-editor-head {
  padding: 16px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.wiki-editor-title-input {
  flex: 1;
}

.wiki-editor-title-input :deep(.el-input__inner) {
  font-size: 22px;
  font-weight: 800;
  border: none;
  background: transparent;
  padding: 0;
}

.wiki-editor-body {
  flex: 1;
  min-height: 0;
  padding: 16px 24px;
  overflow: hidden;
}

.wiki-textarea {
  height: 100%;
}

.wiki-textarea :deep(.el-textarea__inner) {
  height: 100% !important;
  resize: none;
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 0;
  font-size: 15px;
  line-height: 1.9;
}

.wiki-editor-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--el-text-color-secondary);
  font-size: 15px;
}

.icon-picker-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.icon-dot {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.12s, transform 0.12s;
}

.icon-dot:hover {
  transform: scale(1.15);
}

.icon-dot.active {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
}

@media (max-width: 900px) {
  .wiki-workspace {
    grid-template-columns: 1fr;
  }

  .wiki-sidebar {
    display: none;
  }
}
</style>
