'use client'

import { motion } from 'framer-motion'
import { AlertCircle, FileText, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt']

interface UploadZoneProps {
  file: File | null
  onFileSelect: (file: File | null) => void
  onError?: (message: string) => void
  disabled?: boolean
}

export function UploadZone({ file, onFileSelect, onError, disabled }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((selected: File) => {
    const extension = selected.name.toLowerCase().slice(selected.name.lastIndexOf('.'))
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      throw new Error('Please upload a PDF, DOCX, or TXT resume.')
    }
    if (selected.size > 10 * 1024 * 1024) {
      throw new Error('File must be under 10MB.')
    }
    return selected
  }, [])

  const handleFile = useCallback(
    (selected: File | null) => {
      if (!selected) {
        onFileSelect(null)
        return
      }
      try {
        onFileSelect(validateFile(selected))
      } catch (error) {
        onFileSelect(null)
        onError?.(error instanceof Error ? error.message : 'Invalid file.')
      }
    },
    [onFileSelect, onError, validateFile],
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragActive(false)
      if (disabled) return
      const dropped = event.dataTransfer.files?.[0]
      if (dropped) handleFile(dropped)
    },
    [disabled, handleFile],
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all backdrop-blur-xl ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
            : 'border-blue-500/30 bg-gradient-to-br from-slate-900/60 to-slate-950/60 hover:border-blue-400/50'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null
            if (selected) handleFile(selected)
          }}
        />

        <Upload className="mx-auto mb-4 h-12 w-12 text-cyan-400" />
        <h2 className="text-xl font-semibold text-white sm:text-2xl">Upload Resume</h2>
        <p className="mt-2 text-sm text-gray-400 sm:text-base">
          Drag and drop your resume here, or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-500">PDF, DOCX, or TXT · Max 10MB</p>

        <Button
          type="button"
          className="mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 border-0"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation()
            inputRef.current?.click()
          }}
        >
          <Upload className="mr-2 h-4 w-4" />
          Select File
        </Button>
      </div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-between rounded-xl border border-blue-500/20 bg-slate-900/70 px-4 py-3 backdrop-blur"
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-cyan-400" />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={() => onFileSelect(null)}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>No sign-up required. Just upload your resume and get started.</span>
      </div>
    </motion.div>
  )
}
