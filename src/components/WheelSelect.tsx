import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export type WheelSelectOption = { value: string; label: string }

type Props = {
  value: string
  options: WheelSelectOption[]
  onChange: (value: string) => void
  ariaLabel: string
  disabled?: boolean
  className?: string
  placeholder?: ReactNode
}

export function WheelSelect({ value, options, onChange, ariaLabel, disabled = false, className = '', placeholder }: Props) {
  const listboxId = useId()
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const rootRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selected = options[selectedIndex]

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const width = Math.min(Math.max(rect.width, 160), Math.max(160, window.innerWidth - 16))
    const estimatedHeight = Math.min(230, options.length * 31 + 10)
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    const top = rect.bottom + estimatedHeight + 8 <= window.innerHeight
      ? rect.bottom + 4
      : Math.max(8, rect.top - estimatedHeight - 4)
    setMenuStyle({ top, left, width })
  }, [open, options.length, value])

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && (rootRef.current?.contains(target) || (target instanceof Element && target.closest('[data-wheel-select-menu]')))) return
      setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const selectAt = (index: number) => {
    const next = options[index]
    if (!next) return
    onChange(next.value)
    setOpen(false)
  }

  const step = (direction: number) => {
    if (options.length === 0) return
    const nextIndex = (selectedIndex + direction + options.length) % options.length
    selectAt(nextIndex)
  }

  return (
    <div ref={rootRef} className={`wheel-select ${className} ${open ? 'is-open' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className="wheel-select-trigger"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled || options.length === 0}
        onClick={() => setOpen((current) => !current)}
        onWheel={(event) => {
          event.preventDefault()
          if (event.deltaY !== 0) step(event.deltaY > 0 ? 1 : -1)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); step(1) }
          else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); step(-1) }
          else if (event.key === 'Home') { event.preventDefault(); selectAt(0) }
          else if (event.key === 'End') { event.preventDefault(); selectAt(options.length - 1) }
          else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen((current) => !current) }
        }}
      >
        <span>{selected?.label ?? placeholder ?? ''}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && createPortal(
        <div
          id={listboxId}
          className="wheel-select-menu"
          data-wheel-select-menu=""
          role="listbox"
          style={menuStyle}
        >
          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={option.value === value ? 'is-selected' : ''}
              key={option.value}
              onClick={() => selectAt(index)}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.querySelector('.app-shell') ?? document.body,
      )}
    </div>
  )
}
