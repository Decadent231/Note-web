<template>
  <div class="page-shell">
    <div class="toolbar-row" style="justify-content: space-between; margin-bottom: 18px;">
      <div>
        <h1 class="page-title">工作笔记</h1>
        <p class="page-subtitle">支持分类、标签、富文本编辑和摘要管理。</p>
      </div>
      <el-button type="primary" size="large" @click="openCreate">新建笔记</el-button>
    </div>

    <div class="section-card" style="padding: 18px; margin-bottom: 18px;">
      <div class="toolbar-row">
        <el-input v-model="query.keyword" placeholder="搜索标题 / 摘要 / 内容" clearable style="max-width: 260px;" />
        <el-input v-model="query.category" placeholder="分类" clearable style="max-width: 180px;" />
        <el-input v-model="query.tag" placeholder="标签" clearable style="max-width: 180px;" />
        <el-button @click="loadData">查询</el-button>
      </div>
    </div>

    <div class="split-grid">
      <div class="section-card" style="padding: 8px 0;">
        <el-table :data="tableData" style="width: 100%;" @row-click="selected = $event">
          <el-table-column prop="title" label="标题" min-width="180" />
          <el-table-column prop="category" label="分类" width="120">
            <template #default="{ row }">{{ row.category || '未分类' }}</template>
          </el-table-column>
          <el-table-column prop="tags" label="标签" min-width="160">
            <template #default="{ row }">
              <el-tag v-for="tag in splitTags(row.tags)" :key="tag" size="small" style="margin-right: 6px;">{{ tag }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" width="180">
            <template #default="{ row }">{{ formatDate(row.updatedAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" @click="editItem(row)">编辑</el-button>
              <el-button text type="danger" @click="removeItem(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="padding: 16px 18px;">
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

      <div class="section-card" style="padding: 20px;">
        <div style="font-size: 20px; font-weight: 700;">笔记预览</div>
        <div class="page-subtitle" style="margin-bottom: 16px;">点左侧任意笔记查看详情。</div>
        <template v-if="selected">
          <div style="font-size: 24px; font-weight: 800;">{{ selected.title }}</div>
          <div class="toolbar-row" style="margin: 12px 0 16px;">
            <el-tag effect="dark">{{ selected.category || '未分类' }}</el-tag>
            <el-tag v-for="tag in splitTags(selected.tags)" :key="tag" type="success" effect="plain">{{ tag }}</el-tag>
          </div>
          <div class="page-subtitle">{{ selected.summary || '暂无摘要' }}</div>
          <div style="margin-top: 18px; line-height: 1.85;" v-html="selected.content"></div>
        </template>
        <el-empty v-else description="请选择一条笔记" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑笔记' : '新建笔记'" width="900px">
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <div class="toolbar-row">
          <el-form-item label="标题" prop="title" style="flex: 1;">
            <el-input v-model="form.title" placeholder="输入笔记标题" />
          </el-form-item>
          <el-form-item label="分类" style="width: 180px;">
            <el-input v-model="form.category" placeholder="如：项目复盘" />
          </el-form-item>
        </div>

        <div class="toolbar-row">
          <el-form-item label="标签" style="flex: 1;">
            <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
          </el-form-item>
          <el-form-item label="摘要" style="flex: 1;">
            <el-input v-model="form.summary" placeholder="用于列表预览" />
          </el-form-item>
        </div>

        <el-form-item label="内容" prop="content">
          <div class="section-card editor-card" style="width: 100%;">
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
import { noteApi } from '@/api/note'

const formRef = ref()
const dialogVisible = ref(false)
const submitting = ref(false)
const selected = ref(null)
const tableData = ref([])
const pagination = reactive({ current: 1, size: 10, total: 0 })
const query = reactive({ keyword: '', category: '', tag: '' })

const form = reactive({
  id: null,
  title: '',
  category: '',
  tags: '',
  summary: '',
  content: ''
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

function resetForm() {
  Object.assign(form, { id: null, title: '', category: '', tags: '', summary: '', content: '' })
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function editItem(row) {
  Object.assign(form, row)
  dialogVisible.value = true
}

async function loadData() {
  const data = await noteApi.pageNotes({
    current: pagination.current,
    size: pagination.size,
    ...query
  })
  tableData.value = data.records || []
  pagination.total = data.total || 0
  if (tableData.value.length) {
    selected.value = tableData.value[0]
  } else {
    selected.value = null
  }
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
      content: form.content
    }
    if (form.id) {
      await noteApi.updateNote(form.id, payload)
      ElMessage.success('笔记更新成功')
    } else {
      await noteApi.createNote(payload)
      ElMessage.success('笔记创建成功')
    }
    dialogVisible.value = false
    await loadData()
  } finally {
    submitting.value = false
  }
}

async function removeItem(id) {
  await ElMessageBox.confirm('确定删除这条笔记吗？', '删除确认', { type: 'warning' })
  await noteApi.deleteNote(id)
  ElMessage.success('删除成功')
  await loadData()
}

onMounted(loadData)
</script>
