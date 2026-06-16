'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Loader2, RotateCcw, Sparkles, Zap } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { AnalysisResults } from '@/components/analysis-results'
import { UploadZone } from '@/components/upload-zone'
import { Button } from '@/components/ui/button'
import { analyzeResume, checkHealth } from '@/lib/api'
import type { AnalysisState, AnalyzeResponse } from '@/lib/types'

export function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<AnalysisState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    checkHealth().then(setApiOnline)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError('Please upload a resume before analyzing.')
      setState('error')
      return
    }

    setState('loading')
    setError(null)
    setResult(null)

    try {
      const response = await analyzeResume(file)
      setResult(response)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
      setState('error')
    }
  }, [file])

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setState('idle')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-cyan-300">
            <Sparkles className="h-4 w-4" />
            NLP based Project
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Resume
            </span>{' '}
            Analyzer
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400 sm:text-lg">
            Upload your resume and receive personalized feedback to help you build a stronger professional profile.
          </p>

          {apiOnline === false && (
            <div className="mx-auto mt-4 flex max-w-xl items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              <AlertCircle className="h-4 w-4" />
              Backend offline. Start FastAPI at {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}
            </div>
          )}
        </motion.header>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {['Upload Resume', 'Analyze', 'View Results'].map((step, index) => (
            <div
              key={step}
              className="rounded-xl border border-blue-500/10 bg-slate-900/40 px-4 py-3 text-center backdrop-blur"
            >
              <p className="text-xs uppercase tracking-wide text-cyan-400">Step {index + 1}</p>
              <p className="mt-1 text-sm font-medium text-white">{step}</p>
            </div>
          ))}
        </div>

        <UploadZone
          file={file}
          onFileSelect={(selected) => {
            setFile(selected)
            if (state === 'error') {
              setError(null)
              setState('idle')
            }
          }}
          onError={(message) => {
            setError(message)
            setState('error')
          }}
          disabled={state === 'loading'}
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 border-0"
            disabled={!file || state === 'loading'}
            onClick={handleAnalyze}
          >
            {state === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Analyze Resume
              </>
            )}
          </Button>

          {(state === 'success' || state === 'error') && (
            <Button size="lg" variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Analyze Another
            </Button>
          )}
        </div>

        {state === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 rounded-2xl border border-blue-500/20 bg-slate-900/50 p-8 text-center backdrop-blur-xl"
          >
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-400" />
            <p className="mt-4 text-lg font-medium text-white">Running NLP pipeline...</p>
            <p className="mt-2 text-sm text-gray-400">
              Extracting text → cleaning → TF-IDF transform → model prediction
            </p>
          </motion.div>
        )}

        {state === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="font-semibold text-red-200">Analysis Failed</p>
                <p className="mt-1 text-sm text-red-100/80">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'success' && result && (
          <div className="mt-10">
            <AnalysisResults result={result} />
          </div>
        )}
      </div>
    </div>
  )
}
