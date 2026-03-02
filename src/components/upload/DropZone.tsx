'use client'

import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SAMPLE_CSV } from '@/lib/csv-parser'

interface DropZoneProps {
  onFile: (file: File) => void
  loading?: boolean
}

export function DropZone({ onFile, loading }: DropZoneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError(null)
    if (rejected.length > 0) {
      setError('Only CSV files are accepted.')
      return
    }
    if (accepted.length > 0) onFile(accepted[0])
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.csv'] },
    maxFiles: 1,
    maxSize: 5_000_000, // 5 MB
    disabled: loading,
  })

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'flowtrack-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'relative group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-200 cursor-pointer',
          isDragActive && !isDragReject ? 'border-primary bg-primary/5 scale-[1.01]' : '',
          isDragReject ? 'border-destructive bg-destructive/5' : '',
          !isDragActive ? 'border-border hover:border-primary/50 hover:bg-muted/40' : '',
          loading ? 'opacity-50 cursor-not-allowed' : '',
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Scanning animation */}
              <div className="relative w-16 h-20 rounded-lg border-2 border-primary overflow-hidden">
                <FileText className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <motion.div
                  className="absolute inset-x-0 h-0.5 bg-primary/80"
                  animate={{ y: ['-100%', '2000%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <p className="text-sm font-medium text-primary animate-pulse">Parsing your workout plan…</p>
            </motion.div>
          ) : isDragActive && !isDragReject ? (
            <motion.div
              key="drag"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <Upload className="w-10 h-10 text-primary" />
              <p className="text-sm font-medium text-primary">Drop it!</p>
            </motion.div>
          ) : isDragReject ? (
            <motion.div
              key="reject"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <X className="w-10 h-10 text-destructive" />
              <p className="text-sm font-medium text-destructive">Only CSV files please</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Drop your CSV here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or <span className="text-primary underline">browse files</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Format: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">Exercise, Sets, Reps, Weight, Notes</code>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Sample CSV download */}
      <p className="text-center text-xs text-muted-foreground">
        Not sure about the format?{' '}
        <button
          onClick={downloadSample}
          className="text-primary hover:underline"
          type="button"
        >
          Download sample CSV
        </button>
      </p>
    </div>
  )
}
