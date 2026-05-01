<template>
  <div class="md-editor-wrap">
    <div class="md-toolbar">
      <el-tooltip content="加粗" placement="top">
        <el-button text @click="insertSyntax('bold')"><strong>B</strong></el-button>
      </el-tooltip>
      <el-tooltip content="斜体" placement="top">
        <el-button text @click="insertSyntax('italic')"><em>I</em></el-button>
      </el-tooltip>
      <el-tooltip content="删除线" placement="top">
        <el-button text @click="insertSyntax('strike')"><s>S</s></el-button>
      </el-tooltip>
      <el-divider direction="vertical" />
      <el-tooltip content="一级标题" placement="top">
        <el-button text @click="insertSyntax('h1')">H1</el-button>
      </el-tooltip>
      <el-tooltip content="二级标题" placement="top">
        <el-button text @click="insertSyntax('h2')">H2</el-button>
      </el-tooltip>
      <el-tooltip content="三级标题" placement="top">
        <el-button text @click="insertSyntax('h3')">H3</el-button>
      </el-tooltip>
      <el-divider direction="vertical" />
      <el-tooltip content="无序列表" placement="top">
        <el-button text @click="insertSyntax('ul')">• List</el-button>
      </el-tooltip>
      <el-tooltip content="有序列表" placement="top">
        <el-button text @click="insertSyntax('ol')">1. List</el-button>
      </el-tooltip>
      <el-tooltip content="待办列表" placement="top">
        <el-button text @click="insertSyntax('todo')">☑ Todo</el-button>
      </el-tooltip>
      <el-divider direction="vertical" />
      <el-tooltip content="代码块" placement="top">
        <el-button text @click="insertSyntax('code')">Code</el-button>
      </el-tooltip>
      <el-tooltip content="引用" placement="top">
        <el-button text @click="insertSyntax('quote')">Quote</el-button>
      </el-tooltip>
      <el-tooltip content="表格" placement="top">
        <el-button text @click="insertSyntax('table')">Table</el-button>
      </el-tooltip>
      <el-tooltip content="链接" placement="top">
        <el-button text @click="insertSyntax('link')">Link</el-button>
      </el-tooltip>
      <el-tooltip content="插入文件" placement="top">
        <el-button text @click="$emit('pick-file')">
          <el-icon><Paperclip /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="分隔线" placement="top">
        <el-button text @click="insertSyntax('hr')">— HR</el-button>
      </el-tooltip>
      <div class="md-toolbar-spacer" />
      <el-tooltip content="预览" placement="top">
        <el-button text :type="showPreview ? 'primary' : 'default'" @click="showPreview = !showPreview">
          <el-icon><View /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
    <div class="md-body" :class="{ 'with-preview': showPreview }">
      <textarea
        ref="textareaRef"
        class="md-textarea"
        :value="modelValue"
        @input="onInput"
        @keydown="onKeydown"
        placeholder="输入 Markdown 内容..."
      />
      <div v-if="showPreview" class="md-preview" v-html="renderedHtml" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { View, Paperclip } from '@element-plus/icons-vue'
import { renderFileCards } from '@/utils/fileEmbed'

const props = defineProps({
  modelValue: { type: String, default: '' },
  fileMap: { type: Map, default: () => new Map() }
})

const emit = defineEmits(['update:modelValue', 'pick-file'])

const textareaRef = ref(null)
const showPreview = ref(true)

const md = new MarkdownIt({
  html: true,
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

const renderedHtml = computed(() => {
  const raw = md.render(props.modelValue || '')
  return renderFileCards(raw, props.fileMap)
})

function onInput(e) {
  emit('update:modelValue', e.target.value)
}

function insertSyntax(type) {
  const ta = textareaRef.value
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const text = props.modelValue || ''
  const selected = text.substring(start, end)
  let before = ''
  let after = ''
  let insert = ''
  let cursorOffset = 0

  switch (type) {
    case 'bold':
      before = '**'; after = '**'; insert = selected || '粗体文字'; cursorOffset = before.length
      break
    case 'italic':
      before = '*'; after = '*'; insert = selected || '斜体文字'; cursorOffset = before.length
      break
    case 'strike':
      before = '~~'; after = '~~'; insert = selected || '删除线文字'; cursorOffset = before.length
      break
    case 'h1':
      before = '# '; insert = selected || '标题'; cursorOffset = before.length
      break
    case 'h2':
      before = '## '; insert = selected || '标题'; cursorOffset = before.length
      break
    case 'h3':
      before = '### '; insert = selected || '标题'; cursorOffset = before.length
      break
    case 'ul':
      before = '- '; insert = selected || '列表项'; cursorOffset = before.length
      break
    case 'ol':
      before = '1. '; insert = selected || '列表项'; cursorOffset = before.length
      break
    case 'todo':
      before = '- [ ] '; insert = selected || '待办项'; cursorOffset = before.length
      break
    case 'code':
      if (selected.includes('\n')) {
        before = '```\n'; after = '\n```'; insert = selected
      } else {
        before = '`'; after = '`'; insert = selected || '代码'
      }
      cursorOffset = before.length
      break
    case 'quote':
      before = '> '; insert = selected || '引用内容'; cursorOffset = before.length
      break
    case 'table':
      insert = '| 列1 | 列2 | 列3 |\n|------|------|------|\n| 内容 | 内容 | 内容 |'
      cursorOffset = 2
      break
    case 'link':
      before = '['; after = '](https://)'; insert = selected || '链接文字'; cursorOffset = before.length
      break
    case 'hr':
      insert = '\n---\n'; cursorOffset = insert.length
      break
  }

  const newText = text.substring(0, start) + before + insert + after + text.substring(end)
  emit('update:modelValue', newText)

  setTimeout(() => {
    ta.focus()
    const pos = start + cursorOffset + insert.length
    ta.setSelectionRange(pos, pos)
  }, 0)
}

function onKeydown(e) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const ta = textareaRef.value
    const start = ta.selectionStart
    const text = props.modelValue || ''
    const newText = text.substring(0, start) + '  ' + text.substring(ta.selectionEnd)
    emit('update:modelValue', newText)
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + 2
    }, 0)
  }
}
</script>

<style scoped>
.md-editor-wrap {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.md-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  flex-wrap: wrap;
}

.md-toolbar-spacer {
  flex: 1;
}

.md-body {
  display: flex;
  min-height: 340px;
  max-height: 520px;
}

.md-body.with-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.md-textarea {
  width: 100%;
  min-height: 340px;
  max-height: 520px;
  padding: 14px 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  background: transparent;
  tab-size: 2;
}

.md-preview {
  min-height: 340px;
  max-height: 520px;
  overflow: auto;
  padding: 14px 16px;
  border-left: 1px solid var(--el-border-color-lighter);
  line-height: 1.85;
  font-size: 14px;
  word-break: break-word;
}

.md-preview :deep(h1) {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--el-border-color-lighter);
}

.md-preview :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  margin: 20px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.md-preview :deep(h3) {
  font-size: 17px;
  font-weight: 700;
  margin: 16px 0 8px;
}

.md-preview :deep(p) {
  margin: 0 0 10px;
}

.md-preview :deep(ul),
.md-preview :deep(ol) {
  padding-left: 24px;
  margin: 0 0 10px;
}

.md-preview :deep(li) {
  margin-bottom: 4px;
}

.md-preview :deep(blockquote) {
  margin: 10px 0;
  padding: 8px 16px;
  border-left: 4px solid var(--el-color-primary-light-3);
  background: var(--el-fill-color-lighter);
  border-radius: 0 8px 8px 0;
  color: var(--el-text-color-regular);
}

.md-preview :deep(pre.hljs-code-block) {
  margin: 10px 0;
  padding: 14px 18px;
  background: #1e1e2e;
  border-radius: 10px;
  overflow-x: auto;
}

.md-preview :deep(pre.hljs-code-block code) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #cdd6f4;
}

.md-preview :deep(code) {
  padding: 2px 6px;
  background: var(--el-fill-color);
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
}

.md-preview :deep(pre code) {
  padding: 0;
  background: none;
}

.md-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.md-preview :deep(th),
.md-preview :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 8px 12px;
  text-align: left;
}

.md-preview :deep(th) {
  background: var(--el-fill-color-lighter);
  font-weight: 700;
}

.md-preview :deep(hr) {
  border: none;
  border-top: 2px solid var(--el-border-color-lighter);
  margin: 20px 0;
}

.md-preview :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.md-preview :deep(a:hover) {
  text-decoration: underline;
}

.md-preview :deep(input[type="checkbox"]) {
  margin-right: 6px;
}

.md-preview :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}
</style>
