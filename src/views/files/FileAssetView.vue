<template>
  <div class="page-shell">
    <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 18px;">
      <div>
        <h1 class="page-title">文件库</h1>
        <p class="page-subtitle">管理上传的文档、图片、压缩包等文件，支持分类文件夹、搜索与预览。</p>
      </div>
      <el-button type="primary" size="large" @click="showUpload = true">上传文件</el-button>
    </div>

    <div class="file-stats-bar" v-if="storageStats">
      <div class="stat-item">
        <span class="stat-value">{{ storageStats.fileCount || 0 }}</span>
        <span class="stat-label">文件总数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ formatSize(storageStats.totalSize || 0) }}</span>
        <span class="stat-label">已用空间</span>
      </div>
    </div>

    <div class="section-card" style="padding: 18px; margin-bottom: 18px;">
      <div class="toolbar-row">
        <el-input v-model="query.keyword" placeholder="搜索文件名 / 备注" clearable style="max-width: 260px;" @keyup.enter="loadData" />
        <el-select v-model="query.folder" placeholder="文件夹筛选" clearable style="max-width: 200px;" @change="loadData">
          <el-option v-for="f in folders" :key="f" :label="f" :value="f" />
        </el-select>
        <el-button @click="loadData">查询</el-button>
        <el-button text @click="resetQuery">重置</el-button>
      </div>
    </div>

    <div class="section-card file-table-card">
      <el-table :data="files" v-loading="loading" style="width: 100%;" empty-text="还没有上传过文件">
        <el-table-column label="文件名" min-width="240">
          <template #default="{ row }">
            <div class="file-name-cell">
              <el-icon :size="20" :style="{ color: getFileColor(row.extension) }">
                <component :is="getFileIcon(row.extension)" />
              </el-icon>
              <div class="file-name-info">
                <span class="file-name-text">{{ row.originalName }}</span>
                <span v-if="row.remark" class="file-remark">{{ row.remark }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="110" align="center">
          <template #default="{ row }">
            {{ formatSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="folder" label="文件夹" width="130" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.folder" size="small">{{ row.folder }}</el-tag>
            <span v-else style="color: var(--el-text-color-placeholder);">—</span>
          </template>
        </el-table-column>
        <el-table-column label="上传时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="previewFile(row)">预览</el-button>
            <el-button text type="primary" size="small" @click="downloadFile(row)">下载</el-button>
            <el-button text type="primary" size="small" @click="editFile(row)">编辑</el-button>
            <el-button text type="danger" size="small" @click="deleteFile(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-pagination" v-if="pagination.total > pagination.size">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="pagination.total"
          :page-size="pagination.size"
          :current-page="pagination.current"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog v-model="showUpload" title="上传文件" width="520px">
      <el-upload
        ref="uploadRef"
        drag
        :auto-upload="false"
        :limit="5"
        :on-change="onFileChange"
        :on-exceed="() => ElMessage.warning('最多同时上传 5 个文件')"
      >
        <el-icon style="font-size: 40px; color: var(--app-accent-2);"><UploadFilled /></el-icon>
        <div style="margin-top: 8px;">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">单个文件最大 50MB，最多 5 个文件</div>
        </template>
      </el-upload>
      <el-form label-position="top" style="margin-top: 16px;">
        <div class="toolbar-row">
          <el-form-item label="文件夹" style="flex: 1;">
            <el-select v-model="uploadFolder" filterable allow-create placeholder="选择或新建文件夹" clearable style="width: 100%;">
              <el-option v-for="f in folders" :key="f" :label="f" :value="f" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" style="flex: 1; margin-left: 16px;">
            <el-input v-model="uploadRemark" placeholder="可选备注" maxlength="200" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showUpload = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="doUpload">开始上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEdit" title="编辑文件信息" width="480px">
      <el-form label-position="top">
        <el-form-item label="文件名">
          <el-input :model-value="editForm.originalName" disabled />
        </el-form-item>
        <div class="toolbar-row">
          <el-form-item label="文件夹" style="flex: 1;">
            <el-select v-model="editForm.folder" filterable allow-create placeholder="选择或新建文件夹" clearable style="width: 100%;">
              <el-option v-for="f in folders" :key="f" :label="f" :value="f" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" style="flex: 1; margin-left: 16px;">
            <el-input v-model="editForm.remark" placeholder="备注" maxlength="200" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="doEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPreview" :title="previewName" width="80%" top="4vh" destroy-on-close>
      <div class="preview-container">
        <img v-if="previewType === 'image'" :src="previewUrl" class="preview-image" />
        <iframe v-else-if="previewType === 'pdf'" :src="previewUrl" class="preview-iframe" />
        <pre v-else-if="previewType === 'text'" class="preview-text">{{ previewText }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Document, Picture, VideoPlay, Headset, Folder, Memo, Files } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { noteApi } from '@/api/note'
import http from '@/api/http'
import { storage } from '@/utils/storage'

const loading = ref(false)
const files = ref([])
const folders = ref([])
const storageStats = ref(null)
const showUpload = ref(false)
const showEdit = ref(false)
const showPreview = ref(false)
const uploading = ref(false)
const uploadRef = ref(null)
const pendingFiles = ref([])
const uploadFolder = ref('')
const uploadRemark = ref('')

const query = reactive({ keyword: '', folder: '' })
const pagination = reactive({ current: 1, size: 20, total: 0 })
const editForm = reactive({ id: null, folder: '', remark: '', originalName: '' })

const previewUrl = ref('')
const previewType = ref('')
const previewName = ref('')
const previewText = ref('')

function formatDate(v) {
  return v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let s = bytes
  while (s >= 1024 && i < units.length - 1) { s /= 1024; i++ }
  return s.toFixed(i === 0 ? 0 : 1) + ' ' + units[i]
}

function getFileIcon(ext) {
  const map = {
    jpg: Picture, jpeg: Picture, png: Picture, gif: Picture, webp: Picture, svg: Picture, bmp: Picture, ico: Picture,
    mp4: VideoPlay, avi: VideoPlay, mov: VideoPlay, mkv: VideoPlay, wmv: VideoPlay, flv: VideoPlay,
    mp3: Headset, wav: Headset, flac: Headset, aac: Headset, ogg: Headset,
    zip: Folder, rar: Folder, '7z': Folder, tar: Folder, gz: Folder,
    doc: Memo, docx: Memo, txt: Memo, rtf: Memo,
    pdf: Document,
    xls: Files, xlsx: Files, csv: Files,
    ppt: Files, pptx: Files
  }
  return map[ext?.toLowerCase()] || markRaw(Document)
}

function getFileColor(ext) {
  const map = {
    jpg: '#22c55e', jpeg: '#22c55e', png: '#22c55e', gif: '#22c55e', webp: '#22c55e', svg: '#22c55e',
    pdf: '#ef4444',
    doc: '#3b82f6', docx: '#3b82f6',
    xls: '#10b981', xlsx: '#10b981', csv: '#10b981',
    ppt: '#f59e0b', pptx: '#f59e0b',
    zip: '#8b5cf6', rar: '#8b5cf6', '7z': '#8b5cf6',
    mp4: '#ec4899', avi: '#ec4899',
    mp3: '#f97316', wav: '#f97316'
  }
  return map[ext?.toLowerCase()] || '#60a5fa'
}

function resetQuery() {
  query.keyword = ''
  query.folder = ''
  pagination.current = 1
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const data = await noteApi.pageFiles({
      current: pagination.current,
      size: pagination.size,
      keyword: query.keyword || undefined,
      folder: query.folder || undefined
    })
    files.value = data.records || []
    pagination.total = data.total || 0
  } finally {
  loading.value = false
  }
}

async function loadFolders() {
  try {
    folders.value = await noteApi.listFileFolders() || []
  } catch { /* ignore */ }
}

async function loadStats() {
  try {
    storageStats.value = await noteApi.fileStorageStats() || {}
  } catch { /* ignore */ }
}

function handlePageChange(page) {
  pagination.current = page
  loadData()
}

function onFileChange(file) {
  pendingFiles.value.push(file.raw)
}

async function doUpload() {
  if (pendingFiles.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }
  uploading.value = true
  let success = 0
  try {
    for (const file of pendingFiles.value) {
      const fd = new FormData()
      fd.append('file', file)
      if (uploadFolder.value) fd.append('folder', uploadFolder.value)
      if (uploadRemark.value) fd.append('remark', uploadRemark.value)
      await noteApi.uploadFile(fd)
      success++
    }
    ElMessage.success(`成功上传 ${success} 个文件`)
    showUpload.value = false
    pendingFiles.value = []
    uploadFolder.value = ''
    uploadRemark.value = ''
    loadData()
    loadFolders()
    loadStats()
  } catch (e) {
    ElMessage.error('上传失败：' + (e.message || '未知错误'))
  } finally {
    uploading.value = false
  }
}

function editFile(row) {
  editForm.id = row.id
  editForm.folder = row.folder || ''
  editForm.remark = row.remark || ''
  editForm.originalName = row.originalName
  showEdit.value = true
}

async function doEdit() {
  try {
    await noteApi.updateFile(editForm.id, { folder: editForm.folder, remark: editForm.remark })
    ElMessage.success('已更新')
    showEdit.value = false
    loadData()
    loadFolders()
  } catch { /* api interceptor handles error */ }
}

async function deleteFile(row) {
  try {
    await ElMessageBox.confirm(`确定删除文件「${row.originalName}」？删除后不可恢复。`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await noteApi.deleteFile(row.id)
    ElMessage.success('已删除')
    loadData()
    loadStats()
  } catch { /* cancelled */ }
}

function getDownloadUrl(row) {
  const token = storage.get('note-font-token', '')
  const base = import.meta.env.VITE_API_BASE || ''
  return `${base}/note/files/${row.id}/download?token=${encodeURIComponent(token)}`
}

function downloadFile(row) {
  const link = document.createElement('a')
  link.href = getDownloadUrl(row)
  link.download = row.originalName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function previewFile(row) {
  const mime = row.mimeType || ''
  const isImage = mime.startsWith('image/')
  const isPdf = mime === 'application/pdf'
  const isText = mime.startsWith('text/')

  if (!isImage && !isPdf && !isText) {
    ElMessage.info('该文件类型暂不支持预览，请下载后查看')
    return
  }

  previewName.value = row.originalName
  const base = import.meta.env.VITE_API_BASE || ''
  const token = storage.get('note-font-token', '')

  if (isImage) {
    previewUrl.value = `${base}/note/files/${row.id}/preview?token=${encodeURIComponent(token)}`
    previewType.value = 'image'
  } else if (isPdf) {
    previewUrl.value = `${base}/note/files/${row.id}/preview?token=${encodeURIComponent(token)}`
    previewType.value = 'pdf'
  } else if (isText) {
    try {
      const resp = await fetch(`${base}/note/files/${row.id}/preview`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      previewText.value = await resp.text()
      previewType.value = 'text'
    } catch {
      ElMessage.error('无法加载文件内容')
      return
    }
  }
  showPreview.value = true
}

onMounted(() => {
  loadData()
  loadFolders()
  loadStats()
})
</script>

<style scoped>
.file-stats-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 18px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 28px;
  border-radius: 16px;
  background: linear-gradient(155deg, color-mix(in srgb, var(--app-panel-strong) 88%, transparent), var(--app-panel));
  border: 1px solid var(--app-border);
  min-width: 120px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--app-accent-2);
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.file-table-card {
  padding: 0;
  overflow: hidden;
}

.file-table-card :deep(.el-table) {
  background: transparent;
}

.file-table-card :deep(.el-table__header-wrapper th) {
  background: var(--app-panel-strong);
}

.table-pagination {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name-text {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-remark {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.preview-image {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 8px;
}

.preview-iframe {
  width: 100%;
  height: 75vh;
  border: none;
  border-radius: 8px;
}

.preview-text {
  width: 100%;
  max-height: 75vh;
  overflow: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.7;
  padding: 16px;
  border-radius: 12px;
  background: var(--app-panel-strong);
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
