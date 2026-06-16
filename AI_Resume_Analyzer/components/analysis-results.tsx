'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Award,
  Brain,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AnalyzeResponse } from '@/lib/types'

interface AnalysisResultsProps {
  result: AnalyzeResponse
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const normalized = Math.min(Math.max(score, 0), 100)
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (normalized / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" stroke="rgba(59,130,246,0.15)" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{normalized.toFixed(0)}</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-400">/ 100</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-300">{label}</p>
    </div>
  )
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const confidencePercent = (result.confidence_score * 100).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 backdrop-blur">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        <div>
          <p className="font-semibold text-emerald-200">Analysis Complete</p>
          <p className="text-sm text-emerald-300/80">NLP model prediction ready</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-6 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Best Career Match</h3>
          </div>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 sm:text-4xl">
            {result.predicted_category}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30">
              <TrendingUp className="mr-1 h-3 w-3" />
              Resume Alignment Score: {confidencePercent}%
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30">
              <Sparkles className="mr-1 h-3 w-3" />
              Best AI
            </Badge>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Preview: {result.cleaned_text_preview}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-6 backdrop-blur-xl">
          <Award className="mb-4 h-5 w-5 text-cyan-400" />
          <ScoreRing score={result.ats_score} label="Resume Quality Score" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Key Strenghts</h3>
          </div>
          {result.extracted_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.extracted_skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No prominent skills detected in the resume text.</p>
          )}
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Growth Oppertunities</h3>
          </div>
          {result.missing_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-amber-500/15 text-amber-200 hover:bg-amber-500/25"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Strong skill coverage for this role category.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Personlized Recommendations</h3>
        </div>
        <ul className="space-y-3">
          {result.recommendations.map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm text-gray-200"
            >
              <span className="font-semibold text-cyan-400">{index + 1}.</span>
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
