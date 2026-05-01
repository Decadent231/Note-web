<template>
  <div class="page-shell notes-page-shell">
    <div class="toolbar-row page-action-row">
      <div>
        <h1 class="page-title">工作笔记</h1>
        <p class="page-subtitle">支持 Markdown / 富文本双模式编辑、拖动排序、置顶收藏、模板创建。</p>
      </div>
      <el-button type="primary" size="large" @click="openCreate">新建笔记</el-button>
    </div>

    <div class="section-card filter-card">
      <div class="toolbar-row">
        <el-input v-model="query.keyword" placeholder="搜索标题 / 摘要 / 内容" clearable style="max-width: 280px;" />
        <el-input v-model="query.category" placeholder="分类" clearable style="max-width: 180px;" />
        <el-input v-model="query.tag" placeholder="标签" clearable style="max-width: 180px;" />
        <el-checkbox v-model="query.starred" @change="loadData">仅收藏</el-checkbox>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="loadData">查询</el-button>
      </div>
    </div>

    <div class="notes-layout">
      <div class="section-card list-panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">笔记列表</div>
            <div class="panel-subtitle">拖动行可调整顺序，置顶笔记始终在最上方</div>
          </div>
          <el-tag type="info">{{ pagination.total }}</el-tag>
        </div>

        <div class="notes-list">
          <div
            v-for="(item, index) in tableData"
            :key="item.id"
            class="note-row"
            :class="{ active: selected?.id === item.id, dragging: dragState.id === item.id, pinned: item.pinned === 1 }"
            draggable="true"
            @click="selected = item"
            @dragstart="handleDragStart(item.id)"
            @dragover.prevent="handleDragOver(index)"
            @drop.prevent="handleDrop(index)"
            @dragend="handleDragEnd"
          >
            <div class="note-row-handle" aria-hidden="true">⋮⋮</div>

            <div class="note-row-main">
              <div class="note-row-line">
                <el-icon v-if="item.pinned === 1" class="pin-icon" title="已置顶"><Top /></el-icon>
                <span class="note-row-title">{{ item.title }}</span>
                <el-tag v-if="item.contentType === 'markdown'" size="small" type="warning" effect="plain" class="note-tag">MD</el-tag>
                <span v-if="item.summary" class="note-row-summary">（{{ item.summary }}）</span>
                <span class="note-row-divider"></span>
                <span class="note-meta-chip">{{ item.category || '未分类' }}</span>
                <el-tag
                  v-for="tag in splitTags(item.tags)"
                  :key="tag"
                  size="small"
                  effect="plain"
                  class="note-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <div class="note-row-side">
              <div class="note-row-time">{{ formatDate(item.updatedAt) }}</div>
              <div class="note-actions">
                <el-button text :type="item.starred === 1 ? 'warning' : 'default'" @click.stop="toggleStar(item)">
                  <el-icon><StarFilled v-if="item.starred === 1" /><Star v-else /></el-icon>
                </el-button>
                <el-button text :type="item.pinned === 1 ? 'primary' : 'default'" @click.stop="togglePin(item)">
                  <el-icon><Top /></el-icon>
                </el-button>
                <el-button text type="primary" @click.stop="openDetail(item)">详情</el-button>
                <el-button text type="primary" @click.stop="editItem(item)">编辑</el-button>
                <el-button text type="danger" @click.stop="removeItem(item.id)">删除</el-button>
              </div>
            </div>
          </div>

          <el-empty v-if="tableData.length === 0" description="暂无笔记" />
        </div>

        <div class="pagination-wrap">
          <el-pagination
            background
            layout="prev, pager, next, total"
            :total="pagination.total"
            :page-size="pagination.size"
            :current-page="pagination.current"
            @current-change="changePage"
          />
        </div>
      </div>

      <div class="section-card preview-panel">
        <el-button
          v-if="selected"
          class="preview-detail-button"
          link
          type="primary"
          @click="openDetail(selected)"
        >
          详情查看
        </el-button>

        <template v-if="selected">
          <div class="preview-body">
            <div class="preview-title">
              <el-icon v-if="selected.pinned === 1" class="pin-icon" style="margin-right: 6px;"><Top /></el-icon>
              {{ selected.title }}
            </div>
            <div class="preview-tags">
              <el-tag effect="dark">{{ selected.category || '未分类' }}</el-tag>
              <el-tag v-if="selected.contentType === 'markdown'" type="warning" effect="plain">Markdown</el-tag>
              <el-tag
                v-for="tag in splitTags(selected.tags)"
                :key="tag"
                type="success"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="page-subtitle">{{ selected.summary || '暂无摘要' }}</div>
            <div v-if="selected.contentType === 'markdown'" class="preview-content md-preview-body scrollbar-hidden" v-html="renderMarkdown(selected.content || '')"></div>
            <div v-else class="preview-content ql-editor scrollbar-hidden" v-html="selected.content || '<p>暂无内容</p>'"></div>
          </div>
        </template>
        <el-empty v-else description="请选择一条笔记" />
      </div>
    </div>

    <el-dialog v-model="detailVisible" width="960px" class="detail-dialog">
      <template #header>
        <div class="detail-header">
          <div>
            <div class="detail-title">{{ detailItem?.title || '笔记详情' }}</div>
            <div class="page-subtitle">完整查看当前笔记内容与元信息</div>
          </div>
          <el-button v-if="detailItem" type="primary" plain @click="editItem(detailItem)">编辑笔记</el-button>
        </div>
      </template>
      <template v-if="detailItem">
        <div class="detail-meta">
          <el-tag effect="dark">{{ detailItem.category || '未分类' }}</el-tag>
          <el-tag v-if="detailItem.contentType === 'markdown'" type="warning" effect="plain">Markdown</el-tag>
          <el-tag
            v-for="tag in splitTags(detailItem.tags)"
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
          <span class="detail-time">更新于 {{ formatDate(detailItem.updatedAt) }}</span>
        </div>
        <div v-if="detailItem.summary" class="detail-summary">{{ detailItem.summary }}</div>
        <div v-if="detailItem.contentType === 'markdown'" class="detail-content md-preview-body scrollbar-hidden" v-html="renderMarkdown(detailItem.content || '')"></div>
        <div v-else class="detail-content ql-editor scrollbar-hidden" v-html="detailItem.content || '<p>暂无内容</p>'"></div>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑笔记' : '新建笔记'" width="960px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="toolbar-row">
          <el-form-item label="标题" prop="title" style="flex: 1;">
            <el-input v-model="form.title" placeholder="输入笔记标题" />
          </el-form-item>
          <el-form-item label="分类" style="width: 160px;">
            <el-input v-model="form.category" placeholder="例如：项目复盘" />
          </el-form-item>
          <el-form-item label="编辑模式" style="width: 160px;">
            <el-select v-model="form.contentType" style="width: 100%;">
              <el-option label="富文本" value="html" />
              <el-option label="Markdown" value="markdown" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="!form.id" label="使用模板" style="width: 160px;">
            <el-select v-model="selectedTemplateId" clearable placeholder="选择模板" style="width: 100%;" @change="onTemplateChange">
              <el-option
                v-for="tpl in templates"
                :key="tpl.id"
                :label="tpl.name"
                :value="tpl.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <div class="toolbar-row">
          <el-form-item label="标签" style="flex: 1;">
            <el-input v-model="form.tags" placeholder="多个标签用英文逗号分隔" />
          </el-form-item>
          <el-form-item label="摘要" style="flex: 1;">
            <el-input v-model="form.summary" placeholder="用于列表预览" />
          </el-form-item>
        </div>

        <el-form-item label="内容" prop="content">
          <MarkdownEditor
            v-if="form.contentType === 'markdown'"
            v-model="form.content"
          />
          <div v-else class="section-card editor-card" style="width: 100%;">
            <QuillEditor v-model:content="form.content" content-type="html" toolbar="full" theme="snow" />
          </div>
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
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import { Top, Star, StarFilled } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { noteApi } from '@/api/note'
import MarkdownEditor from './MarkdownEditor.vue'

const NOTE_ORDER_KEY = 'note-font:notes-order'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs-code-block"><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch (_) {}
    }
    return `<pre class="hljs-code-block"><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

function renderMarkdown(content) {
  return md.render(content || '')
}

const formRef = ref()
const dialogVisible = ref(false)
const detailVisible = ref(false)
const submitting = ref(false)
const selected = ref(null)
const detailItem = ref(null)
const tableData = ref([])
const templates = ref([])
const selectedTemplateId = ref(null)
const dragState = reactive({ id: null, overIndex: -1 })
const pagination = reactive({ current: 1, size: 8, total: 0 })
const query = reactive({ keyword: '', category: '', tag: '', starred: false })

const form = reactive({
  id: null,
  title: '',
  category: '',
  tags: '',
  summary: '',
  content: '',
  contentType: 'html'
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

function formatDate(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
}

function splitTags(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function readOrder() {
  try {
    return JSON.parse(window.localStorage.getItem(NOTE_ORDER_KEY) || '[]')
  } catch {
    return []
  }
}

function writeOrder(list) {
  window.localStorage.setItem(NOTE_ORDER_KEY, JSON.stringify(list.map((item) => item.id)))
}

function sortBySavedOrder(records) {
  const order = readOrder()
  if (!order.length) {
    return records
  }
  const orderMap = new Map(order.map((id, index) => [id, index]))
  const pinned = records.filter((r) => r.pinned === 1)
  const unpinned = records.filter((r) => r.pinned !== 1)
  pinned.sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf())
  unpinned.sort((a, b) => {
    const aIndex = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER
    const bIndex = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER
    if (aIndex === bIndex) {
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf()
    }
    return aIndex - bIndex
  })
  return [...pinned, ...unpinned]
}

function syncSelected() {
  if (!tableData.value.length) {
    selected.value = null
    return
  }
  if (!selected.value) {
    selected.value = tableData.value[0]
    return
  }
  const current = tableData.value.find((item) => item.id === selected.value.id)
  selected.value = current || tableData.value[0]
}

function resetForm() {
  Object.assign(form, { id: null, title: '', category: '', tags: '', summary: '', content: '', contentType: 'html' })
  selectedTemplateId.value = null
}

async function loadTemplates() {
  try {
    templates.value = await noteApi.listTemplates()
  } catch {
    templates.value = []
  }
}

function onTemplateChange(tplId) {
  if (!tplId) return
  const tpl = templates.value.find((t) => t.id === tplId)
  if (tpl) {
    form.content = tpl.content
    form.contentType = tpl.contentType || 'markdown'
  }
}

function openCreate() {
  resetForm()
  loadTemplates()
  dialogVisible.value = true
}

function openDetail(item) {
  detailItem.value = item
  detailVisible.value = true
}

function editItem(row) {
  Object.assign(form, {
    id: row.id,
    title: row.title,
    category: row.category,
    tags: row.tags,
    summary: row.summary,
    content: row.content,
    contentType: row.contentType || 'html'
  })
  detailVisible.value = false
  dialogVisible.value = true
}

function reorderNotes(sourceIndex, targetIndex) {
  if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) {
    return
  }
  const next = [...tableData.value]
  const [moved] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, moved)
  tableData.value = next
  writeOrder(next)
  syncSelected()
}

function handleDragStart(id) {
  dragState.id = id
}

function handleDragOver(index) {
  dragState.overIndex = index
}

function handleDrop(index) {
  const sourceIndex = tableData.value.findIndex((item) => item.id === dragState.id)
  reorderNotes(sourceIndex, index)
  handleDragEnd()
}

function handleDragEnd() {
  dragState.id = null
  dragState.overIndex = -1
}

async function loadData() {
  const params = {
    current: pagination.current,
    size: pagination.size,
    keyword: query.keyword || undefined,
    category: query.category || undefined,
    tag: query.tag || undefined,
    starred: query.starred || undefined
  }
  const data = await noteApi.pageNotes(params)
  const records = sortBySavedOrder(data.records || [])
  tableData.value = records
  pagination.total = data.total || 0
  syncSelected()
}

function resetQuery() {
  query.keyword = ''
  query.category = ''
  query.tag = ''
  query.starred = false
  pagination.current = 1
  loadData()
}

function changePage(page) {
  pagination.current = page
  loadData()
}

async function submit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = {
      title: form.title,
      category: form.category,
      tags: form.tags,
      summary: form.summary,
      content: form.content,
      contentType: form.contentType
    }
    if (form.id) {
      await noteApi.updateNote(form.id, payload)
      ElMessage.success('笔记更新成功')
    } else {
      if (selectedTemplateId.value) {
        payload.templateId = selectedTemplateId.value
      }
      await noteApi.createNote(payload)
      ElMessage.success('笔记创建成功')
    }
    dialogVisible.value = false
    await loadData()
  } finally {
    submitting.value = false
  }
}

async function togglePin(item) {
  await noteApi.togglePin(item.id)
  await loadData()
}

async function toggleStar(item) {
  await noteApi.toggleStar(item.id)
  await loadData()
}

async function removeItem(id) {
  await ElMessageBox.confirm('删除后将移至回收站，确定删除吗？', '删除确认', { type: 'warning' })
  await noteApi.deleteNote(id)
  ElMessage.success('已移至回收站')
  if (detailItem.value?.id === id) {
    detailVisible.value = false
    detailItem.value = null
  }
  await loadData()
}

onMounted(loadData)
</script>

<style scoped>
.page-action-row {
  justify-content: space-between;
  margin-bottom: 18px;
}

.notes-page-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.filter-card {
  padding: 18px;
  margin-bottom: 18px;
}

.notes-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(380px, 0.92fr);
  gap: 16px;
  align-items: start;
}

.list-panel,
.preview-panel {
  padding: 18px;
  height: 100%;
  min-height: 0;
}

.list-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
}

.panel-subtitle {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.notes-list {
  display: grid;
  gap: 10px;
  flex: 1;
  min-height: 0;
  align-content: start;
  align-items: start;
}

.note-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 58px;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1px solid var(--app-border);
  background: linear-gradient(155deg, color-mix(in srgb, var(--app-panel-strong) 88%, transparent), var(--app-panel));
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.07);
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.note-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.1);
}

.note-row.active {
  border-color: color-mix(in srgb, var(--app-accent-2) 55%, var(--app-border));
  box-shadow: 0 18px 34px color-mix(in srgb, var(--app-accent-2) 18%, transparent);
}

.note-row.pinned {
  border-left: 3px solid var(--el-color-primary);
}

.note-row.dragging {
  opacity: 0.68;
}

.note-row-handle {
  color: var(--el-text-color-placeholder);
  font-size: 20px;
  line-height: 1;
  letter-spacing: 2px;
}

.note-row-main {
  min-width: 0;
}

.note-row-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pin-icon {
  color: var(--el-color-primary);
  font-size: 14px;
  flex-shrink: 0;
}

.note-row-title {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.note-row-summary {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--app-text-soft);
  font-size: 13px;
}

.note-row-divider {
  flex-shrink: 0;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--app-text-soft);
  opacity: 0.7;
}

.note-meta-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-accent-2) 12%, transparent);
  color: color-mix(in srgb, var(--app-accent-2) 76%, var(--app-text));
  font-weight: 600;
  font-size: 12px;
}

.note-tag {
  flex-shrink: 0;
  margin: 0;
}

.note-row-side {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.note-row-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.note-actions {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.pagination-wrap {
  padding-top: 18px;
  margin-top: 12px;
}

.preview-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.preview-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.preview-detail-button {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 1;
}

.preview-title {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.25;
  margin-top: 0;
  padding-right: 72px;
  display: flex;
  align-items: center;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 16px;
}

.preview-content {
  margin-top: 18px;
  padding-right: 8px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  line-height: 1.9;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.detail-title {
  font-size: 24px;
  font-weight: 800;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-time {
  margin-left: auto;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.detail-summary {
  margin-bottom: 18px;
  color: var(--el-text-color-regular);
  line-height: 1.75;
}

.detail-content {
  max-height: 70vh;
  overflow: auto;
  padding-right: 10px;
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

.md-preview-body :deep(li) {
  margin-bottom: 4px;
}

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

.md-preview-body :deep(pre code) {
  padding: 0;
  background: none;
}

.md-preview-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.md-preview-body :deep(th),
.md-preview-body :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 8px 12px;
  text-align: left;
}

.md-preview-body :deep(th) {
  background: var(--el-fill-color-lighter);
  font-weight: 700;
}

.md-preview-body :deep(hr) {
  border: none;
  border-top: 2px solid var(--el-border-color-lighter);
  margin: 20px 0;
}

.md-preview-body :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.md-preview-body :deep(a:hover) {
  text-decoration: underline;
}

.md-preview-body :deep(input[type="checkbox"]) {
  margin-right: 6px;
}

.md-preview-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

@media (max-width: 1280px) {
  .note-row {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
  }

  .note-row-side {
    grid-column: 2;
    justify-content: space-between;
    margin-top: 8px;
  }
}

@media (max-width: 1100px) {
  .notes-layout {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .detail-header {
    flex-direction: column;
  }

  .detail-time {
    margin-left: 0;
  }
}

@media (max-width: 720px) {
  .note-row-line {
    flex-wrap: nowrap;
  }

  .note-row-side {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .note-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

html.dark .note-row {
  background: linear-gradient(155deg, rgba(20, 31, 46, 0.96), rgba(12, 20, 31, 0.9));
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
}

html.dark .note-row:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.34);
}
</style>
