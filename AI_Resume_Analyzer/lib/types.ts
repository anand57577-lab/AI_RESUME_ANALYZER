export interface AnalyzeResponse {
  predicted_category: string
  confidence_score: number
  ats_score: number
  extracted_skills: string[]
  missing_skills: string[]
  recommendations: string[]
  cleaned_text_preview: string
}

export type AnalysisState = 'idle' | 'loading' | 'success' | 'error'
