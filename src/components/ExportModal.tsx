import { useState } from 'react'
import { GameState, ExportFormat } from '../types'
import { exportGame, downloadExport, copyToClipboard } from '../utils/exporter'

interface ExportModalProps {
  game: GameState
  onClose: () => void
}

export default function ExportModal({ game, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('ai-prompt')
  const [copied, setCopied] = useState(false)
  const [preview, setPreview] = useState(false)

  const formats: { id: ExportFormat; label: string; icon: string; desc: string }[] = [
    { id: 'ai-prompt', label: 'AI总结提示词', icon: '🤖', desc: '生成可交给AI的提示词，让AI将你的经历写成小说' },
    { id: 'markdown', label: 'Markdown', icon: '📄', desc: '完整时间线+属性+关系，适合阅读和分享' },
    { id: 'json', label: 'JSON', icon: '💾', desc: '结构化数据，适合程序处理' },
  ]

  const handleCopy = async () => {
    const ok = await copyToClipboard(game, format)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📤 导出人生记录</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="format-list">
          {formats.map(f => (
            <button
              key={f.id}
              className={`format-btn ${format === f.id ? 'active' : ''}`}
              onClick={() => { setFormat(f.id); setPreview(false) }}
            >
              <span className="format-icon">{f.icon}</span>
              <div className="format-info">
                <span className="format-label">{f.label}</span>
                <span className="format-desc">{f.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {preview && (
          <div className="export-preview">
            <pre>{exportGame(game, format).slice(0, 1500)}...</pre>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setPreview(!preview)}>
            {preview ? '收起预览' : '👁 预览'}
          </button>
          <button className="btn btn-ghost" onClick={handleCopy}>
            {copied ? '✅ 已复制' : '📋 复制'}
          </button>
          <button className="btn btn-primary" onClick={() => downloadExport(game, format)}>
            ⬇️ 下载文件
          </button>
        </div>
      </div>
    </div>
  )
}
