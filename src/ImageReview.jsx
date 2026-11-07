import { apiUrl } from './api'
import { useState } from 'react'
import {
  Sparkles,
  AlertTriangle,
  LoaderCircle,
  Image as ImageIcon,
  X
} from 'lucide-react'

function formatInlineText(text) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function formatAnalysis(result) {
  return result.split('\n').map((line, index) => {
    const trimmed = line.trim()

    if (!trimmed) return null

    if (trimmed.startsWith('#')) {
      const heading = trimmed.replace(/^#+\s*/, '')
      return (
        <h4 className="analysis-section-heading" key={index}>
          {heading}
        </h4>
      )
    }

    if (/^[-*•]\s/.test(trimmed)) {
      return (
        <div className="analysis-bullet" key={index}>
          <span>•</span>
          <p>{formatInlineText(trimmed.replace(/^[-*•]\s*/, ''))}</p>
        </div>
      )
    }

    return (
      <p className="analysis-line" key={index}>
        {formatInlineText(trimmed)}
      </p>
    )
  })
}

function ImageReview() {
  const [preview, setPreview] = useState('')
  const [file, setFile] = useState(null)
  const [dimensions, setDimensions] = useState(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Extract score from Gemini's response
  const scoreMatch = result.match(
    /(?:Brand Consistency Score|Brand Consistency|Score):\s*(\d{1,3})\s*\/\s*100/i
  )

  const score = scoreMatch ? Number(scoreMatch[1]) : null

  function uploadImage(event) {
    const selected = event.target.files[0]
    if (!selected) return

    if (!['image/jpeg', 'image/png'].includes(selected.type)) {
      alert('Please upload a JPG or PNG image.')
      event.target.value = ''
      return
    }

    if (selected.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5 MB.')
      event.target.value = ''
      return
    }

    const url = URL.createObjectURL(selected)
    const img = new window.Image()

    img.onload = () => {
      if (preview) URL.revokeObjectURL(preview)

      setFile(selected)
      setPreview(url)
      setDimensions({
        width: img.width,
        height: img.height
      })
      setResult('')
      setError('')
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      alert('Unable to load image.')
    }

    img.src = url
  }

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview)

    setPreview('')
    setFile(null)
    setDimensions(null)
    setResult('')
    setError('')

    const input = document.getElementById('poster-upload')
    if (input) input.value = ''
  }

  async function reviewImage() {
    if (!file) {
      setError('Please upload an image first.')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(
  apiUrl('/api/analyze-image'),
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Image analysis failed.')
      }

      setResult(data.analysis || 'Gemini returned an empty response.')
    } catch (err) {
      setError(
        err.message || 'Unable to connect to the INKLOOM backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-panel">
      <p className="eyebrow">AI-POWERED VISUAL GOVERNANCE</p>

      <h2>Image & Poster Review</h2>

      <p className="subtitle">
        Analyse posters, advertisements, logos and social media
        creatives against your saved Brand DNA using Gemini AI.
      </p>

      <label htmlFor="poster-upload">
        Choose image (JPG or PNG)
      </label>

      <input
        id="poster-upload"
        className="form-input"
        type="file"
        accept="image/png,image/jpeg"
        onChange={uploadImage}
      />

      {preview && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <strong>
              <ImageIcon size={17} style={{ verticalAlign: 'middle' }} />
              {' '}Image Preview
            </strong>

            <button
              type="button"
              onClick={clearImage}
              className="secondary-button"
              disabled={loading}
            >
              <X size={15} /> Remove
            </button>
          </div>

          <img
            src={preview}
            alt="Uploaded marketing creative"
            style={{
              maxWidth: '100%',
              maxHeight: 350,
              objectFit: 'contain',
              borderRadius: 12,
              display: 'block'
            }}
          />

          <p className="helper-text">
            {file?.name}
          </p>

          {dimensions && (
            <p className="helper-text">
              Resolution: {dimensions.width} × {dimensions.height}px
            </p>
          )}

          <button
            className="primary-button"
            onClick={reviewImage}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={17} />
                Analysing Image...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Analyse with Gemini AI
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div
          className="issue-card"
          style={{ marginTop: 20 }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="analysis-results" style={{ marginTop: 24 }}>
          <div className="analysis-header">
            <div>
              <p className="eyebrow">GEMINI AI REPORT</p>
              <h3>
                <Sparkles size={19} />
                {' '}INKLOOM AI Analysis
              </h3>
            </div>

            {score !== null && (
              <div className="analysis-score">
                <span>Brand Score</span>
                <strong>
                  {score}<small>/100</small>
                </strong>
              </div>
            )}
          </div>

          <div className="analysis-content">
            {formatAnalysis(result)}
          </div>

          <div className="analysis-disclaimer">
            <AlertTriangle size={17} />
            <p>
              AI-generated findings are recommendations for human
              review. Always verify important claims and decisions
              before publication.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default ImageReview
