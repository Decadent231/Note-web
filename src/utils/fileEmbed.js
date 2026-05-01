const FILE_REF_REGEX = /\{\{file:(\d+)\}\}/g

export function renderFileCards(html, fileMap) {
  return html.replace(FILE_REF_REGEX, (_, id) => {
    const file = fileMap.get(Number(id))
    if (!file) return `<span class="file-embed-missing">[文件#${id}]</span>`
    const sizeStr = formatSize(file.fileSize)
    const iconColor = getColor(file.extension)
    return `<div class="file-embed-card" data-file-id="${file.id}">` +
      `<div class="file-embed-left">` +
        `<span class="file-embed-icon" style="color:${iconColor}">${getIcon(file.extension)}</span>` +
        `<div class="file-embed-info">` +
          `<span class="file-embed-name">${escHtml(file.originalName)}</span>` +
          `<span class="file-embed-meta">${sizeStr}${file.folder ? ' · ' + escHtml(file.folder) : ''}</span>` +
        `</div>` +
      `</div>` +
      `<div class="file-embed-actions">` +
        `<button class="file-embed-btn file-embed-btn-preview" data-action="preview" data-file-id="${file.id}">预览</button>` +
        `<button class="file-embed-btn file-embed-btn-download" data-action="download" data-file-id="${file.id}">下载</button>` +
      `</div>` +
    `</div>`
  })
}

export function extractFileIds(content) {
  const ids = []
  let m
  const re = new RegExp(FILE_REF_REGEX.source, 'g')
  while ((m = re.exec(content)) !== null) {
    ids.push(Number(m[1]))
  }
  return [...new Set(ids)]
}

export function insertFileRef(content, fileId) {
  return content + `\n{{file:${fileId}}}\n`
}

function escHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0, s = bytes
  while (s >= 1024 && i < units.length - 1) { s /= 1024; i++ }
  return s.toFixed(i === 0 ? 0 : 1) + ' ' + units[i]
}

const iconMap = {
  pdf: '&#128196;', doc: '&#128221;', docx: '&#128221;', txt: '&#128221;', rtf: '&#128221;',
  xls: '&#128202;', xlsx: '&#128202;', csv: '&#128202;',
  ppt: '&#128200;', pptx: '&#128200;',
  jpg: '&#128247;', jpeg: '&#128247;', png: '&#128247;', gif: '&#128247;', webp: '&#128247;', svg: '&#128247;', bmp: '&#128247;',
  mp4: '&#127909;', avi: '&#127909;', mov: '&#127909;', mkv: '&#127909;',
  mp3: '&#127925;', wav: '&#127925;', flac: '&#127925;',
  zip: '&#128230;', rar: '&#128230;', '7z': '&#128230;', tar: '&#128230;', gz: '&#128230;'
}

function getIcon(ext) {
  return iconMap[ext?.toLowerCase()] || '&#128196;'
}

const colorMap = {
  jpg: '#22c55e', jpeg: '#22c55e', png: '#22c55e', gif: '#22c55e', webp: '#22c55e', svg: '#22c55e',
  pdf: '#ef4444',
  doc: '#3b82f6', docx: '#3b82f6',
  xls: '#10b981', xlsx: '#10b981', csv: '#10b981',
  ppt: '#f59e0b', pptx: '#f59e0b',
  zip: '#8b5cf6', rar: '#8b5cf6', '7z': '#8b5cf6',
  mp4: '#ec4899', avi: '#ec4899',
  mp3: '#f97316', wav: '#f97316'
}

function getColor(ext) {
  return colorMap[ext?.toLowerCase()] || '#60a5fa'
}
