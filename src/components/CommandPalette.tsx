import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search } from 'lucide-react'

export type PaletteCommand = {
  id: string
  label: string
  hint?: string
  shortcut?: string
  run: () => void | Promise<void>
}

type Props = {
  open: boolean
  commands: PaletteCommand[]
  onClose: () => void
}

export function CommandPalette({ open, commands, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return commands
    return commands.filter((command) => `${command.label} ${command.hint ?? ''} ${command.id}`.toLowerCase().includes(keyword))
  }, [commands, query])

  useEffect(() => {
    setActiveIndex((current) => (current >= filtered.length ? Math.max(0, filtered.length - 1) : current))
  }, [filtered.length])

  if (!open) return null

  const execute = (command: PaletteCommand | undefined) => {
    if (!command) return
    onClose()
    void command.run()
  }

  return createPortal(
    <div className="command-palette-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="命令面板">
        <div className="command-palette-input">
          <Search size={15} />
          <input
            ref={inputRef}
            value={query}
            placeholder="搜索命令，例如：导出、备份、专注"
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0) }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((current) => Math.min(filtered.length - 1, current + 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((current) => Math.max(0, current - 1))
              } else if (event.key === 'Enter') {
                event.preventDefault()
                execute(filtered[activeIndex])
              } else if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
              }
            }}
          />
        </div>
        <ul className="command-palette-list" role="listbox" aria-label="命令列表">
          {filtered.length === 0 && <li className="command-palette-empty">没有匹配的命令</li>}
          {filtered.slice(0, 40).map((command, index) => (
            <li
              key={command.id}
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? 'active' : ''}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => { event.preventDefault(); execute(command) }}
            >
              <span>{command.label}</span>
              {command.hint && <small>{command.hint}</small>}
              {command.shortcut && <kbd>{command.shortcut}</kbd>}
            </li>
          ))}
        </ul>
        <footer>↑↓ 选择 · Enter 执行 · Esc 关闭</footer>
      </section>
    </div>,
    document.querySelector('.app-shell') ?? document.body,
  )
}