<template>
  <div class="page-shell wiki-space-shell">
    <div class="wiki-space-header">
      <div class="wiki-space-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="wiki-space-icon">{{ spaceInfo.icon }}</span>
        <div>
          <h1 class="page-title">{{ spaceInfo.name || '知识库' }}</h1>
          <p class="page-subtitle">{{ spaceInfo.description || '' }}</p>
        </div>
      </div>
      <div class="wiki-space-header-right">
        <el-button type="primary" plain @click="showAddPage = true">
          <el-icon><Plus /></el-icon>
          新建页面
        </el-button>
      </div>
    </div>

    <div class="wiki-space-body">
      <div class="wiki-tree-panel section-card">
        <div class="tree-panel-header">
          <span class="tree-panel-title">目录</span>
        </div>
        <div class="tree-panel-body scrollbar-hidden">
          <el-tree
            v-if="treeData.length > 0"
            :data="treeData"
            :props="{ label: 'title', children: 'children' }"
            node-key="id"
            highlight-current
            default-expand-all
            :current-node-key="currentPageId"
            @current-change="onTreeSelect"
          >
            <template #default="{ node, data }">
              <div class="tree-node-row">
                <span class="tree-node-label">{{ node.label }}</span>
                <div class="tree-node-actions">
                  <el-button text size="small" type="primary" @click.stop="addChildPage(data)">
                    <el-icon size="14"><Plus /></el-icon>
                  </el-button>
                  <el-button text size="small" type="danger" @click.stop="deletePageNode(data)">
                    <el-icon size="14"><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
          </el-tree>
          <el-empty v-else description="还没有页面，点击「新建页面」开始写作" :image-size="80" />
        </div>
      </div>

      <div class="wiki-content-panel section-card">
        <template v-if="currentPage">
          <div class="content-panel-header">
            <span class="content-title">{{ currentPage.title }}</span>
            <div class="content-actions">
              <el-button text type="primary" @click="enterEdit">编辑</el-button>
              <el-button text type="danger" @click="deleteCurrentPage">删除</el-button>
            </div>
          </div>
          <div class="content-panel-body scrollbar-hidden">
            <div v-if="currentPage.contentType === 'markdown'" class="md-preview-body" v-html="renderMarkdown(currentPage.content || '')"></div>
            <div v-else class="ql-editor" v-html="currentPage.content || '<p>暂无内容</p>'"></div>
          </div>
        </template>
        <el-empty v-else description="从左侧目录选择页面查看" />
      </div>
    </div>

    <el-dialog v-model="showAddPage" title="新建页面" width="480px">
      <el-form label-position="top">
        <el-form-item label="页面标题" required>
          <el-input v-model="newPage.title" placeholder="输入页面标题" />
        </el-form-item>
        <el-form-item label="编辑模式">
          <el-select v-model="newPage.contentType" style="width: 100%;">
            <el-option label="Markdown" value="markdown" />
            <el-option label="富文本" value="html" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddPage = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="createPage">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEdit" title="编辑页面" width="90%" top="3vh" fullscreen destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="内容">
          <MarkdownEditor v-if="editForm.contentType === 'markdown'" v-model="editForm.content" />
          <div v-else style="width: 100%;">
            <QuillEditor v-model:content="editForm.content" content-type="html" toolbar="full" theme="snow" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="savePage">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, ArrowLeft } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { noteApi } from '@/api/note'
import MarkdownEditor from '../notes/MarkdownEditor.vue'

const route = useRoute()
const router = useRouter()
const spaceId = route.params.spaceId

const spaceInfo = ref({})
const treeData = ref([])
const currentPageId = ref(null)
const currentPage = ref(null)
const saving = ref(false)

const showAddPage = ref(false)
const newPage = reactive({ title: '', contentType: 'markdown', parentId: null })

const showEdit = ref(false)
const editForm = reactive({ id: null, title: '', content: '', contentType: 'markdown' })

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try { return `<pre class="hljs-code-block"><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang }).value}</code></pre>` } catch (_) {}
    }
    return `<pre class="hljs-code-block"><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

function renderMarkdown(content) { return md.render(content || '') }

function goBack() { router.push('/wiki') }

async function loadSpace() {
  try { spaceInfo.value = await noteApi.getWikiSpace(spaceId) } catch { /* ignore */ }
}

async function loadTree() {
  try { treeData.value = await noteApi.getWikiPageTree(spaceId) } catch { treeData.value = [] }
}

async function onTreeSelect(data) {
  if (!data?.id) return
  currentPageId.value = data.id
  try { currentPage.value = await noteApi.getWikiPage(data.id) } catch { /* ignore */ }
}

function addChildPage(parentData) {
  newPage.title = ''
  newPage.contentType = 'markdown'
  newPage.parentId = parentData.id
  showAddPage.value = true
}

async function createPage() {
  if (!newPage.title?.trim()) { ElMessage.warning('请输入页面标题'); return }
  saving.value = true
  try {
    await noteApi.createWikiPage({
      spaceId: Number(spaceId),
      title: newPage.title.trim(),
      contentType: newPage.contentType,
      parentId: newPage.parentId || undefined,
      content: ''
    })
    showAddPage.value = false
    newPage.parentId = null
    await loadTree()
    ElMessage.success('页面已创建')
  } finally { saving.value = false }
}

function enterEdit() {
  if (!currentPage.value) return
  Object.assign(editForm, {
    id: currentPage.value.id,
    title: currentPage.value.title,
    content: currentPage.value.content || '',
    contentType: currentPage.value.contentType || 'markdown'
  })
  showEdit.value = true
}

async function savePage() {
  if (!editForm.title?.trim()) { ElMessage.warning('标题不能为空'); return }
  saving.value = true
  try {
    await noteApi.updateWikiPage(editForm.id, {
      title: editForm.title.trim(),
      content: editForm.content,
      contentType: editForm.contentType
    })
    showEdit.value = false
    await loadTree()
    currentPage.value = await noteApi.getWikiPage(editForm.id)
    ElMessage.success('保存成功')
  } finally { saving.value = false }
}

async function deletePageNode(data) {
  await ElMessageBox.confirm(`确定删除页面「${data.title}」及其所有子页面？`, '删除确认', { type: 'warning' })
  await noteApi.deleteWikiPage(data.id)
  if (currentPageId.value === data.id) { currentPageId.value = null; currentPage.value = null }
  await loadTree()
  ElMessage.success('已删除')
}

async function deleteCurrentPage() {
  if (!currentPage.value) return
  await deletePageNode({ id: currentPage.value.id, title: currentPage.value.title })
}

onMounted(() => { loadSpace(); loadTree() })
</script>

<style scoped>
.wiki-space-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.wiki-space-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-shrink: 0;
}

.wiki-space-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wiki-space-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wiki-space-icon {
  font-size: 36px;
  line-height: 1;
}

.wiki-space-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  align-items: stretch;
}

.wiki-tree-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.tree-panel-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.tree-panel-title {
  font-weight: 700;
  font-size: 15px;
}

.tree-panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px;
}

.tree-node-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 2px 0;
}

.tree-node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.tree-node-actions {
  display: none;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.tree-node-row:hover .tree-node-actions {
  display: flex;
}

.wiki-content-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.content-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.content-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--el-text-color-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.content-panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px;
  line-height: 1.9;
}

.md-preview-body :deep(h1) {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--el-border-color-lighter);
}

.md-preview-body :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  margin: 20px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.md-preview-body :deep(h3) {
  font-size: 17px;
  font-weight: 700;
  margin: 16px 0 8px;
}

.md-preview-body :deep(p) {
  margin: 0 0 10px;
}

.md-preview-body :deep(ul),
.md-preview-body :deep(ol) {
  padding-left: 24px;
  margin: 0 0 10px;
}

.md-preview-body :deep(li) { margin-bottom: 4px; }

.md-preview-body :deep(blockquote) {
  margin: 10px 0;
  padding: 8px 16px;
  border-left: 4px solid var(--el-color-primary-light-3);
  background: var(--el-fill-color-lighter);
  border-radius: 0 8px 8px 0;
  color: var(--el-text-color-regular);
}

.md-preview-body :deep(pre.hljs-code-block) {
  margin: 10px 0;
  padding: 14px 18px;
  background: #1e1e2e;
  border-radius: 10px;
  overflow-x: auto;
}

.md-preview-body :deep(pre.hljs-code-block code) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #cdd6f4;
}

.md-preview-body :deep(code) {
  padding: 2px 6px;
  background: var(--el-fill-color);
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
}

.md-preview-body :deep(pre code) { padding: 0; background: none; }

.md-preview-body :deep(table) { border-collapse: collapse; width: 100%; margin: 10px 0; }

.md-preview-body :deep(th),
.md-preview-body :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 8px 12px;
  text-align: left;
}

.md-preview-body :deep(th) { background: var(--el-fill-color-lighter); font-weight: 700; }

.md-preview-body :deep(hr) { border: none; border-top: 2px solid var(--el-border-color-lighter); margin: 20px 0; }

.md-preview-body :deep(a) { color: var(--el-color-primary); text-decoration: none; }
.md-preview-body :deep(a:hover) { text-decoration: underline; }

.md-preview-body :deep(img) { max-width: 100%; border-radius: 8px; }

.md-preview-body :deep(input[type="checkbox"]) { margin-right: 6px; }

@media (max-width: 900px) {
  .wiki-space-body {
    grid-template-columns: 1fr;
  }
}
</style>
