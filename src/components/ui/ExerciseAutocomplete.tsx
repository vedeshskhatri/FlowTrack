'use client'

import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchExercises, type ExerciseEntry } from '@/lib/exercise-library'

interface ExerciseAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const GROUP_COLORS: Record<string, string> = {
  Chest:      'text-rose-400',
  Back:       'text-sky-400',
  Legs:       'text-emerald-400',
  Shoulders:  'text-violet-400',
  Arms:       'text-amber-400',
  Core:       'text-orange-400',
  Cardio:     'text-pink-400',
  'Full Body':'text-[#C9A84C]',
}

export function ExerciseAutocomplete({ value, onChange, placeholder, className }: ExerciseAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<ExerciseEntry[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchExercises(query))
      setOpen(true)
    } else {
      setResults([])
      setOpen(false)
    }
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(entry: ExerciseEntry) {
    setQuery(entry.name)
    onChange(entry.name)
    setOpen(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value) }}
          placeholder={placeholder ?? 'Search exercises…'}
          className="pl-9 rounded-none border-border focus:border-[#C9A84C]"
          onFocus={() => { if (results.length > 0) setOpen(true) }}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 border border-border bg-background shadow-lg overflow-hidden">
          {results.map((entry) => (
            <button
              key={entry.name}
              type="button"
              onMouseDown={() => select(entry)} // mousedown fires before blur
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted transition-colors text-left group"
            >
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-foreground">
                  {entry.name}
                </p>
                {entry.equipment && (
                  <p className="text-[10px] text-muted-foreground font-light">{entry.equipment}</p>
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${GROUP_COLORS[entry.group] ?? 'text-muted-foreground'}`}>
                {entry.group}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
