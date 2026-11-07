import { apiUrl } from './api'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, BookOpen, FileCheck, History,
  Settings, Bell, Search, Plus, ArrowUpRight,
  ShieldCheck, AlertTriangle, CheckCircle2,
  FileText, Sparkles, ChevronDown, Menu
} from 'lucide-react'
import './App.css'
import ImageReview from './ImageReview'


function App() {
  const [active, setActive] = useState('Dashboard')
  const [content, setContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

const searchablePages = [
  'Dashboard',
  'Brand Guidelines',
  'Content Checker',
  'Approval Center',
  'History'
]

const filteredSearchPages = searchablePages.filter(page =>
  page.toLowerCase().includes(searchQuery.trim().toLowerCase())
)

const handleSearchKeyDown = (event) => {
  if (event.key === 'Enter' && filteredSearchPages.length > 0) {
    setActive(filteredSearchPages[0])
    setSearchQuery('')
  }

  if (event.key === 'Escape') {
    setSearchQuery('')
  }
}

  const handleImageReviewDecision = async (id, status) => {
    try {
      const response = await fetch(apiUrl(`/api/reviews/${id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not update review')
      }

      setApprovalReviews(prev =>
        prev.filter(review => review.id !== id)
      )

    } catch (error) {
      console.error('Approval error:', error)
      alert('Could not update the review. Please try again.')
    }
  }

const defaultBrandDNA = {
  brandName: 'INKLOOM',
  tone: 'Professional and friendly',
  personality: 'Premium and creative',
  approvedWords: 'Innovative, elegant, thoughtful',
  restrictedWords: 'Best in the world, guaranteed results',
  brandRules:
    'Use clear language. Avoid unsupported claims. Maintain a professional and friendly voice.',
  brandColors: ''
}

const [initialBrandDNA] = useState(() => {
  try {
    const saved = localStorage.getItem('inkloomBrandDNA')
    return saved ? { ...defaultBrandDNA, ...JSON.parse(saved) } : defaultBrandDNA
  } catch {
    return defaultBrandDNA
  }
})

const [brandName, setBrandName] = useState(initialBrandDNA.brandName)
const [tone, setTone] = useState(initialBrandDNA.tone)
const [personality, setPersonality] = useState(initialBrandDNA.personality)
const [approvedWords, setApprovedWords] = useState(initialBrandDNA.approvedWords)
const [restrictedWords, setRestrictedWords] = useState(initialBrandDNA.restrictedWords)
const [brandRules, setBrandRules] = useState(initialBrandDNA.brandRules)
const [brandColors, setBrandColors] = useState(initialBrandDNA.brandColors || '')
useEffect(() => {
  fetch(apiUrl('/api/brand'))
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load Brand DNA')
      }
      return response.json()
    })
    .then(data => {
      if (data && data.brand_name) {
        setBrandName(data.brand_name)
        setTone(data.tone || '')
        setPersonality(data.personality || '')
        setApprovedWords(data.approved_words || '')
        setRestrictedWords(data.restricted_words || '')
        setBrandRules(data.brand_rules || '')
        setBrandColors(data.brand_colors || '')

        localStorage.setItem('inkloomBrandDNA', JSON.stringify({
          brandName: data.brand_name,
          tone: data.tone || '',
          personality: data.personality || '',
          approvedWords: data.approved_words || '',
          restrictedWords: data.restricted_words || '',
          brandRules: data.brand_rules || '',
          brandColors: data.brand_colors || ''
        }))
      }
    })
    .catch(error => {
      console.error('Brand DNA loading error:', error)
    })
}, [])
const [analyzed, setAnalyzed] = useState(false)
const [analysisResult, setAnalysisResult] = useState(null)
const [approvalStatus, setApprovalStatus] = useState('Pending Review')
const [reviewHistory, setReviewHistory] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('inkloomReviewHistory')) || []
  } catch {
    return []
  }
})

const [dbReviewHistory, setDbReviewHistory] = useState(null)
const [approvalReviews, setApprovalReviews] = useState([])
useEffect(() => {
  if (active !== 'Approval Center') return

  fetch(apiUrl('/api/reviews'))
    .then(response => response.json())
    .then(data => {
      setApprovalReviews(
        data.filter(item => item.status === 'Pending')
      )
    })
    .catch(error => {
      console.error('Approval loading error:', error)
    })
}, [active])

useEffect(() => {
if (active !== 'History' && active !== 'Dashboard') return

  fetch(apiUrl('/api/reviews'))
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch review history')
      }
      return response.json()
    })
    .then(data => {
      const formattedHistory = data.map(item => ({
        id: item.id,
        brandName: item.brand_name,
        content: item.content,
        score: item.compliance_score,
        issues: item.issues_count,
        status: item.status,
        reviewedAt: item.reviewed_at
      }))

      setDbReviewHistory(formattedHistory)
    })
    .catch(error => {
      console.error('History loading error:', error)
      setDbReviewHistory(null)
    })
}, [active])

const displayedHistory = dbReviewHistory ?? reviewHistory


async function saveBrandDNA() {
 const data = {
  brandName,
  tone,
  personality,
  approvedWords,
  restrictedWords,
  brandRules,
  brandColors
}

  // Save locally
  try {
    localStorage.setItem('inkloomBrandDNA', JSON.stringify(data))
  } catch {
    alert('Unable to save Brand DNA locally.')
    return
  }

  // Save to MySQL through Flask
  try {
    const response = await fetch(
      apiUrl('/api/brand'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brand_name: brandName,
          tone: tone,
          personality: personality,
          approved_words: approvedWords,
          restricted_words: restrictedWords,
          brand_rules: brandRules,
          brand_colors: brandColors
        })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'MySQL saving failed')
    }

    alert('Brand DNA saved successfully in MySQL!')
    console.log('Brand DNA saved:', result)

  } catch (error) {
    console.error('Brand DNA error:', error)
    alert('Brand DNA saved locally, but MySQL saving failed. Check whether Flask is running.')
  }
}


  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Brand Guidelines', icon: BookOpen },
    { name: 'Content Checker', icon: FileCheck },
    { name: 'Approval Center', icon: ShieldCheck },
    { name: 'History', icon: History },
  ]


function analyzeContent() {
  if (!content.trim()) {
    alert('Please enter some content to check.')
    return
  }

  const restrictedList = restrictedWords
    .split(',')
    .map(word => word.trim())
    .filter(word => word.length > 0)

  const foundIssues = restrictedList.filter(word =>
    content.toLowerCase().includes(word.toLowerCase())
  )

  const score = Math.max(0, 100 - foundIssues.length * 20)

  setAnalysisResult({
    score,
    issues: foundIssues,
    passed: foundIssues.length === 0
  })

  setApprovalStatus('Pending Review')
  setAnalyzed(true)
}


async function handleReview(status) {
 
  if (!analysisResult) {
    alert('Please analyze the content first.')
    return
  }

  const newReview = {
    id: Date.now(),
    brandName: brandName,
    content: content,
    score: analysisResult.score,
    issues: analysisResult.issues.length,
    status: status,
    reviewedAt: new Date().toLocaleString()
  }

  setApprovalStatus(status)

  const updatedHistory = [newReview, ...reviewHistory]

  setReviewHistory(updatedHistory)

  try {
    localStorage.setItem(
      'inkloomReviewHistory',
      JSON.stringify(updatedHistory)
    )
  } catch {
    alert('Review status updated, but history could not be saved locally.')
  }

  // Save the review to MySQL through Flask
  try {
    const response = await fetch(
      apiUrl('/api/reviews'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brand_name: brandName,
          content: content,
          score: analysisResult.score,
          issues: analysisResult.issues.length,
          status: status
        })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'MySQL save failed')
    }

    console.log('Review saved to MySQL:', result)

    alert('Review status updated and saved successfully!')
  } catch (error) {
    console.error('Backend error:', error)
    alert('Review saved in browser history, but MySQL saving failed. Check whether Flask is running.')
  }
}

const statsHistory = displayedHistory

const totalReviewed = statsHistory.length

const averageScore = totalReviewed > 0
  ? (
      statsHistory.reduce(
        (sum, item) => sum + Number(item.score || 0),
        0
      ) / totalReviewed
    ).toFixed(1)
  : 0

const totalIssues = statsHistory.reduce(
  (sum, item) => sum + Number(item.issues || 0),
  0
)

const pendingApprovals = statsHistory.filter(
  item => ['Pending', 'Pending Review'].includes(item.status)
).length


  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-symbol">I</div>
          <div>
            <h2>INKLOOM<span> AI</span></h2>
            <small>BRAND GOVERNANCE</small>
          </div>
        </div>

        <div className="workspace">
          <span className="workspace-dot"></span>
          My Workspace
          <ChevronDown size={15} />
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav>
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${active === name ? 'active' : ''}`}
              onClick={() => {
                setActive(name)   
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
             {name === 'Approval Center' && pendingApprovals > 0 && (
  <span className="nav-count">{pendingApprovals}</span>
)}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={19} />
            Settings
          </button>
          <div className="profile">
            <div className="avatar">K</div>
            <div>
              <strong>Workspace Admin</strong>
              <small>Administrator</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <Menu size={19} />
            <span>Workspace</span>
            <span>/</span>
            <strong>{active}</strong>
          </div>
          <div className="top-actions">
           <div className="search-box">
  <Search size={16} />

  <input
    placeholder="Search pages..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={handleSearchKeyDown}
  />

  <kbd>↵</kbd>

  {searchQuery.trim() && (
    <div className="search-results">
      {filteredSearchPages.length > 0 ? (
        filteredSearchPages.map((page) => (
          <button
            type="button"
            key={page}
            onClick={() => {
              setActive(page)
              setSearchQuery('')
            }}
          >
            <Search size={14} />
            {page}
          </button>
        ))
      ) : (
        <p>No matching pages found</p>
      )}
    </div>
  )}
</div>
            <button className="icon-button"><Bell size={19} /></button>
            <div className="avatar">K</div>
          </div>
        </header>

        <div className="page-content">
          {active === 'Dashboard' && (
            <>
              <div className="welcome-row">
                <div>
                  <p className="eyebrow">THURSDAY, NOVEMBER 5, 2026</p>
                  <h1>Good evening, Admin <span>✦</span></h1>
                  <p className="subtitle">Here's what's happening with your brand today.</p>
                </div>
                <button className="primary-button" onClick={() => setActive('Content Checker')}>
                  <Plus size={18} /> Check new content
                </button>
              </div>

              <section className="hero-card">
                <div className="hero-copy">
                  <span className="hero-tag"><Sparkles size={14} /> YOUR BRAND, PROTECTED</span>
                  <h2>Create Freely.<br />Stay On Brand.</h2>
                  <p>Keep every message consistent, every visual aligned, and every piece of content true to your brand identity.</p>
                  <button onClick={() => setActive('Content Checker')}>
                    Start content review <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="hero-art">
                  <div className="orbit orbit-one"></div>
                  <div className="orbit orbit-two"></div>
                  <div className="hero-center"><ShieldCheck size={65} /></div>
                  <div className="floating-icon icon-one"><FileText /></div>
                  <div className="floating-icon icon-two"><CheckCircle2 /></div>
                  <div className="floating-icon icon-three"><Sparkles /></div>
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <h2>Overview</h2>
                  <p>A quick look at your brand governance activity.</p>
                </div>
                <button className="period-button">Last 30 days <ChevronDown size={15} /></button>
              </div>

             
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-top">
      <span>Total content reviewed</span>
      <FileText />
    </div>
    <h2>{totalReviewed}</h2>
    <p className="muted">Completed content reviews</p>
  </div>

  <div className="stat-card">
    <div className="stat-top">
      <span>Average compliance score</span>
      <ShieldCheck />
    </div>
    <h2>{averageScore}%</h2>
    <p className="muted">Across completed reviews</p>
  </div>

  <div className="stat-card">
    <div className="stat-top">
      <span>Issues detected</span>
      <AlertTriangle />
    </div>
    <h2>{totalIssues}</h2>
    <p className="muted">Across completed reviews</p>
  </div>

  <div className="stat-card">
    <div className="stat-top">
      <span>Pending approvals</span>
      <CheckCircle2 />
    </div>
    <h2>{pendingApprovals}</h2>
    <p className="muted">Awaiting human review</p>
  </div>
</div>


              <div className="bottom-grid">
      
<section className="panel">
  <div className="panel-heading">
    <div>
      <h3>Recent activity</h3>
      <p>Latest content governance updates</p>
    </div>
    <button onClick={() => setActive('History')}>
      View all <ArrowUpRight size={15} />
    </button>
  </div>

 {displayedHistory.length > 0 ? (
    displayedHistory.slice(0, 4).map((item) => (
      <div className="activity-row" key={item.id}>
        <div className={`activity-icon ${
          item.status === 'Approved' ? 'green' : 'orange'
        }`}>
          {item.status === 'Approved'
            ? <CheckCircle2 />
            : <AlertTriangle />}
        </div>

        <div>
          <strong>{item.brandName} content review</strong>
          <small>
            {item.issues} issues detected · {item.reviewedAt}
          </small>
        </div>

        <span className={`status ${
          item.status === 'Approved' ? 'approved' : 'review'
        }`}>
          {item.status}
        </span>
      </div>
    ))
  ) : (
    <div className="empty-state">
      <FileText size={32} />
      <p>No recent activity yet.</p>
      <small>Completed content reviews will appear here.</small>
    </div>
  )}
</section>


              
<section className="panel score-panel">
  <h3>Brand health score</h3>
  <p>Your overall brand consistency</p>

  <div
    className="score-circle"
    style={{
      background: `conic-gradient(
        #9875c5 ${Number(averageScore)}%,
        #eee7f2 ${Number(averageScore)}%
      )`
    }}
  >
    <div>
      <strong>{Math.round(Number(averageScore))}</strong>
      <small>/100</small>
    </div>
  </div>

  <span className="score-label">
    <span></span>
    {Number(averageScore) >= 90
      ? 'Excellent consistency'
      : Number(averageScore) >= 75
        ? 'Good consistency'
        : Number(averageScore) >= 60
          ? 'Needs improvement'
          : 'Needs attention'}
  </span>

  <small className="score-note">
    Based on completed content reviews
  </small>
</section>

              </div>
            </>
          )}

      
{active === 'Brand Guidelines' && (
  <section className="page-panel brand-dna-page">
    <p className="eyebrow">YOUR BRAND IDENTITY</p>
    <h1>Build your Brand DNA ✦</h1>
    <p className="subtitle">
      Teach INKLOOM how your brand thinks, speaks and communicates.
    </p>

    <div className="dna-intro">
      <Sparkles size={22} />
      <div>
        <strong>Every brand has a personality.</strong>
        <p>Define yours so your content can stay consistent everywhere.</p>
      </div>
    </div>

    <label>01 — Brand name</label>
    <input
      className="form-input"
      value={brandName}
      onChange={e => setBrandName(e.target.value)}
      placeholder="Enter your brand name"
    />

    <label>02 — Brand personality</label>
    <select
      className="form-input"
      value={personality}
      onChange={e => setPersonality(e.target.value)}
    >
      <option>Premium and creative</option>
      <option>Professional and trustworthy</option>
      <option>Friendly and approachable</option>
      <option>Bold and energetic</option>
      <option>Minimal and elegant</option>
      <option>Playful and youthful</option>
    </select>

    <label>03 — Communication tone</label>
    <select
      className="form-input"
      value={tone}
      onChange={e => setTone(e.target.value)}
    >
      <option>Professional and friendly</option>
      <option>Formal and authoritative</option>
      <option>Warm and conversational</option>
      <option>Creative and expressive</option>
      <option>Simple and informative</option>
      <option>Luxury and sophisticated</option>
    </select>

    <label>04 — Preferred vocabulary</label>
    <textarea
      className="form-textarea"
      value={approvedWords}
      onChange={e => setApprovedWords(e.target.value)}
      placeholder="Words your brand prefers..."
    />

    <label>05 — Restricted words and phrases</label>
    <textarea
      className="form-textarea"
      value={restrictedWords}
      onChange={e => setRestrictedWords(e.target.value)}
      placeholder="Words or claims your brand avoids..."
    />

    <label>06 — Additional brand rules</label>
    <textarea
      className="form-textarea"
      value={brandRules}
      onChange={e => setBrandRules(e.target.value)}
      placeholder="Write your brand-specific rules..."
    />
<label>07 — Brand colour palette</label>

<input
  className="form-input"
  value={brandColors}
  onChange={e => setBrandColors(e.target.value)}
  placeholder="#1F3A5F, #F4EBDD, #D4A373"
/>

<div className="brand-color-preview">
  {brandColors.split(',').map((color, index) => {
    const cleanColor = color.trim()

    return /^#[0-9A-Fa-f]{6}$/.test(cleanColor) ? (
      <div
        key={index}
        className="brand-color-swatch"
        style={{ backgroundColor: cleanColor }}
        title={cleanColor}
      />
    ) : null
  })}
</div>

    <div className="dna-footer">
      <div>
        <ShieldCheck size={19} />
        <span>Your brand identity configuration</span>
      </div>
     <button
  className="primary-button"
  onClick={saveBrandDNA}
>
  <CheckCircle2 size={17} />
  Save Brand DNA
</button>
    </div>
  </section>
)}


          {active === 'Content Checker' && (
            <section className="page-panel">
              <p className="eyebrow">AI-POWERED REVIEW</p>
              <h1>Content Checker</h1>
              <p className="subtitle">Review your content against your brand guidelines.</p>
              <label>Content title</label>
              <input className="form-input" placeholder="e.g. Product launch announcement" />
              <label>Paste your content</label>
              <textarea className="form-textarea content-input" placeholder="Paste your marketing copy, social media post, email or other content here..." value={content} onChange={e => {setContent(e.target.value); setAnalyzed(false)}} />
              <div className="helper-text">{content.length} characters</div>
              <button className="primary-button" onClick={analyzeContent}><Sparkles size={17} /> Analyze content</button>
           {analyzed && analysisResult && (
  <div className="analysis-results">
    <div className="analysis-heading">
      <h2>Brand Compliance Report</h2>
      <span className={analysisResult.passed ? 'status-pass' : 'status-warning'}>
        {analysisResult.passed ? 'Passed' : 'Needs Review'}
      </span>
    </div>

    <div className="compliance-score">
      <span>{analysisResult.score}%</span>
      <p>Prototype compliance score</p>
    </div>

    <div className="issues-section">
      <h3>Detected Issues</h3>

      {analysisResult.issues.length > 0 ? (
        <ul>
       {analysisResult.issues.map((word, index) => {
  const suggestions = {
    'best in the world': 'A leading choice',
    'guaranteed results': 'Designed to support your goals'
  }

  const suggestion = suggestions[word.toLowerCase()]
    || 'Review this phrase and use wording that follows your brand guidelines.'

  return (
    <li key={index} className="issue-card">
      <div>
        <AlertTriangle size={16} />
        <strong>Restricted phrase: {word}</strong>
      </div>

      <p>
        <strong>Suggested correction:</strong> {suggestion}
      </p>
    </li>
  )
})}
        </ul>
      ) : (
        <p className="success-message">
          <CheckCircle2 size={17} />
          No restricted phrases found in your content.
        </p>
      )}
    </div>
  </div>
)}

<ImageReview />

</section>
          )}


{active === 'Approval Center' && (
  <section className="page-panel approval-page">
    <p className="eyebrow">HUMAN REVIEW</p>
    <h1>Approval Center</h1>
    <p className="subtitle">
      Review content before it gets published.
    </p>

    {approvalReviews.length > 0 ? (
      <div className="approval-list">
        {approvalReviews.map(review => {
          const isImageReview = review.content.startsWith('IMAGE ANALYSIS:')

          const analysisText = review.content
            .replace(/^IMAGE ANALYSIS:\s*/i, '')
            .trim()

          const scoreMatch = analysisText.match(
            /(?:Brand Consistency Score|Brand Consistency|Score)[^0-9]{0,20}(\d{1,3})\s*\/\s*100/i
          )

          const score = review.compliance_score ??
            (scoreMatch ? Number(scoreMatch[1]) : null)

          const issueMatches = analysisText.match(
            /Direct Violation|Potential Violation|Style Inconsistency|Critical Violation|Major Violation|Minor Violation/gi
          ) || []

          const issues = review.issues_count > 0
            ? review.issues_count
            : issueMatches.length

          return (
            <div className="approval-card" key={review.id}>

              <div className="approval-card-header">
                <div className="approval-title">
                  <span className="approval-icon">
                    {isImageReview ? <Sparkles size={20} /> : <FileText size={20} />}
                  </span>

                  <div>
                    <h3>
                      {isImageReview
                        ? 'Image Review Request'
                        : 'Content Review Request'}
                    </h3>
                    <p>Brand: {review.brand_name}</p>
                  </div>
                </div>

                <span className="approval-pending">
                  <span></span>
                  Pending
                </span>
              </div>

              <div className="approval-metrics">
                <div className="approval-metric">
                  <span>Compliance Score</span>
                  <strong>
                    {score !== null ? `${score}%` : 'Not available'}
                  </strong>
                </div>

                <div className="approval-metric">
                  <span>Detected Issues</span>
                  <strong>{issues}</strong>
                </div>

                <div className="approval-metric">
                  <span>Review Type</span>
                  <strong>{isImageReview ? 'Visual' : 'Text'}</strong>
                </div>
              </div>

              <div className="approval-analysis">
                <div className="approval-analysis-heading">
                  <div>
                    <Sparkles size={17} />
                    <h4>AI Brand Governance Analysis</h4>
                  </div>
                  <span>Gemini AI</span>
                </div>

                <div className="submitted-content">
                  {analysisText}
                </div>
              </div>

              <div className="approval-note">
                <ShieldCheck size={17} />
                <p>
                  Final publication decisions remain with the human reviewer.
                </p>
              </div>

              <div className="approval-actions">
                <button
                  className="primary-button approve-button"
                  onClick={() =>
                    handleImageReviewDecision(review.id, 'Approved')
                  }
                >
                  <CheckCircle2 size={17} />
                  Approve Content
                </button>

                <button
                  className="secondary-button changes-button"
                  onClick={() =>
                    handleImageReviewDecision(review.id, 'Needs Changes')
                  }
                >
                  <AlertTriangle size={17} />
                  Request Changes
                </button>
              </div>

            </div>
          )
        })}
      </div>
    ) : (
      <div className="empty-state">
        <ShieldCheck size={42} />
        <h3>No live approval requests yet</h3>
        <p>
          Analyze content in Content Checker to send it here for review.
        </p>
      </div>
    )}
  </section>
)}

         
{active === 'History' && (
  <section className="page-panel">
    <p className="eyebrow">AUDIT TRAIL</p>
    <h1>Review History</h1>
    <p className="subtitle">
      Track content checks and governance activity.
    </p>

   {displayedHistory.length > 0 ? (
      <div className="history-list">
       {displayedHistory.map((item) => (
          <div className="history-card" key={item.id}>
            <div className="history-card-header">
              <div>
                <h3>{item.brandName}</h3>
                <p>{item.reviewedAt}</p>
              </div>

              <span
                className={
                  item.status === 'Approved'
                    ? 'status-approved'
                    : 'status-changes'
                }
              >
                {item.status}
              </span>
            </div>

            <div className="history-content">
              <p>{item.content}</p>
            </div>

            <div className="history-details">
              <span>Compliance Score: <strong>{item.score}%</strong></span>
              <span>Issues Found: <strong>{item.issues}</strong></span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <History size={42} />
        <h3>No review history yet</h3>
        <p>
          Approved content and requested changes will appear here.
        </p>
      </div>
    )}
  </section>
)}

        </div>
      </main>
    </div>
  )
}

export default App
