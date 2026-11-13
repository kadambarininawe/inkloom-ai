import { apiFetch } from './api'
import { useState, useEffect } from 'react'
import {
 LayoutDashboard, BookOpen, FileCheck, History,
Settings, Bell, Search, Plus, ArrowUpRight,
ShieldCheck, AlertTriangle, CheckCircle2,
FileText, Sparkles, ChevronDown, Menu, UserRound
} from 'lucide-react'
import './App.css'
import ImageReview from './ImageReview'


function App() {
  
  const [active, setActive] = useState('Dashboard')
  const [content, setContent] = useState('')
  const [revisionReviewId, setRevisionReviewId] = useState(null)
  const [revisionType, setRevisionType] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days')
    const [authUser, setAuthUser] = useState(null)
    const [profileName, setProfileName] = useState('')
const [profileEmail, setProfileEmail] = useState('')
const [profileMessage, setProfileMessage] = useState('')
const [profileEditing, setProfileEditing] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

   
useEffect(() => {
  apiFetch('/api/me')
    .then(response => {
      if (!response.ok) {
        setAuthUser(null)
        return null
      }
      return response.json()
    })
    .then(data => {
      if (data) {
        setAuthUser(data.user)
        setProfileName(data.user.name || '')
        setProfileEmail(data.user.email || '')
      }
    })
    .catch(error => {
      console.error('Authentication check failed:', error)
      setAuthUser(null)
    })
    .finally(() => {
      setAuthLoading(false)
    })
}, [])



function handleDemoLogin() {
  setAuthMode('login')
  setAuthEmail('demo2026@inkloom.ai')
  setAuthPassword('InkloomDemo2026!')
  setAuthError('')
}

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthError('')

    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter your email and password.')
      return
    }

    if (authMode === 'register' && !authName.trim()) {
      setAuthError('Please enter your name.')
      return
    }

    try {
      const response = await apiFetch(
        authMode === 'register' ? '/api/register' : '/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: authName.trim(),
            email: authEmail.trim(),
            password: authPassword
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.')
      }

      setAuthUser(data.user)
      setAuthPassword('')
      setAuthError('')

    } catch (error) {
      setAuthError(error.message || 'Unable to connect to the server.')
    }
  }


    async function handleLogout() {
    try {
      const response = await apiFetch('/api/logout', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Logout failed.')
      }

      setAuthUser(null)
      setAuthPassword('')
      setActive('Dashboard')

    } catch (error) {
      alert(error.message || 'Could not log out.')
    }
  }

async function handleProfileUpdate(event) {
  event.preventDefault()
  setProfileMessage('')

  try {
    const response = await apiFetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: profileName,
        email: profileEmail
      })
    })

    const data = await response.json()

    if (!response.ok) {
      setProfileMessage(data.error || 'Profile update failed.')
      return
    }

    setAuthUser(data.user)
    setProfileMessage('Profile updated successfully!')

  } catch (error) {
    setProfileMessage('Could not connect to the server.')
  }
}

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
  let reviewerFeedback = ''

  if (status === 'Needs Changes') {
    reviewerFeedback = window.prompt(
      'Explain what needs to be changed:'
    )

    if (reviewerFeedback === null) {
      return
    }

    if (!reviewerFeedback.trim()) {
      alert('Please enter feedback before requesting changes.')
      return
    }
  }

  try {
    const response = await apiFetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status,
        reviewer_feedback: reviewerFeedback.trim()
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Could not update review')
    }

    setApprovalReviews(prev =>
      prev.filter(review => review.id !== id)
    )

    alert(
      status === 'Needs Changes'
        ? 'Feedback saved successfully!'
        : 'Review approved successfully!'
    )

  } catch (error) {
    console.error('Approval error:', error)
    alert(error.message || 'Could not update the review. Please try again.')
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

const [initialBrandDNA] = useState(defaultBrandDNA)

const [brandName, setBrandName] = useState(initialBrandDNA.brandName)
const [tone, setTone] = useState(initialBrandDNA.tone)
const [personality, setPersonality] = useState(initialBrandDNA.personality)
const [approvedWords, setApprovedWords] = useState(initialBrandDNA.approvedWords)
const [restrictedWords, setRestrictedWords] = useState(initialBrandDNA.restrictedWords)
const [brandRules, setBrandRules] = useState(initialBrandDNA.brandRules)
const [brandColors, setBrandColors] = useState(initialBrandDNA.brandColors || '')
useEffect(() => {
  if (!authUser) return

  // Reset fields before loading this account's Brand DNA
  setBrandName(defaultBrandDNA.brandName)
  setTone(defaultBrandDNA.tone)
  setPersonality(defaultBrandDNA.personality)
  setApprovedWords(defaultBrandDNA.approvedWords)
  setRestrictedWords(defaultBrandDNA.restrictedWords)
  setBrandRules(defaultBrandDNA.brandRules)
  setBrandColors(defaultBrandDNA.brandColors)

  apiFetch('/api/brand')
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
      }
    })
    .catch(error => {
      console.error('Brand DNA loading error:', error)
    })
}, [authUser?.id])
const [analyzed, setAnalyzed] = useState(false)
const [analysisResult, setAnalysisResult] = useState(null)
const [approvalStatus, setApprovalStatus] = useState('Pending Review')
const [reviewHistory, setReviewHistory] = useState([])

const [dbReviewHistory, setDbReviewHistory] = useState([])
const [approvalReviews, setApprovalReviews] = useState([])
useEffect(() => {
  if (!authUser || active !== 'Approval Center') return

  setApprovalReviews([])

  apiFetch('/api/reviews')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load approval requests')
      }
      return response.json()
    })
    .then(data => {
      setApprovalReviews(
        data.filter(item =>
  item.status === 'Pending' ||
  item.status === 'Pending Review'
)
      )
    })
    .catch(error => {
      console.error('Approval loading error:', error)
      setApprovalReviews([])
    })
}, [active, authUser?.id])
  

useEffect(() => {
  if (!authUser) return

  if (active !== 'History' && active !== 'Dashboard') return

  setDbReviewHistory([])

  apiFetch('/api/reviews')
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
  reviewedAt: item.reviewed_at,
  reviewerFeedback: item.reviewer_feedback
}))

      setDbReviewHistory(formattedHistory)
    })
    .catch(error => {
      console.error('History loading error:', error)
      setDbReviewHistory([])
    })
}, [active, authUser?.id])



const displayedHistory = dbReviewHistory


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


  // Save to MySQL through Flask
  try {
    const response = await apiFetch('/api/brand', {
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
alert('Brand DNA could not be saved. Please check your connection and try again.')
  }
}


const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Brand Guidelines', icon: BookOpen },
  { name: 'Content Checker', icon: FileCheck },
  { name: 'Approval Center', icon: ShieldCheck },
  { name: 'History', icon: History },
  { name: 'Profile', icon: UserRound },
]

function handleReviseReview(item) {
  setRevisionReviewId(item.id)

  if (item.content?.startsWith('IMAGE ANALYSIS:')) {
    setRevisionType('image')
    setContent('')
  } else {
    setRevisionType('text')
    setContent(item.content || '')
  }

  setAnalyzed(false)
  setActive('Content Checker')
}

async function analyzeContent() {
  if (!content.trim()) {
    alert('Please enter some content to check.')
    return
  }

  try {
    const response = await apiFetch('/api/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.error || 'AI analysis failed.')
      return
    }

    setAnalysisResult({
      score: data.score,
      issues: data.issues,
      passed: data.issues.length === 0,
      summary: data.summary
    })

    setApprovalStatus('Pending Review')
    setAnalyzed(true)
try {
  const isRevision = revisionReviewId !== null

  const saveResponse = await apiFetch(
    isRevision
      ? `/api/reviews/${revisionReviewId}`
      : '/api/reviews',
    {
      method: isRevision ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...(isRevision ? {} : { brand_name: brandName }),
        content,
        score: data.score,
        issues: data.issues.length,
        status: 'Pending Review'
      })
    }
  )

  const saveData = await saveResponse.json()

  if (!saveResponse.ok) {
    throw new Error(saveData.error || 'Could not save review.')
  }

  if (isRevision) {
    setRevisionReviewId(null)
    alert('Revised content resubmitted successfully!')
  } else {
    alert('Content submitted for approval successfully!')
  }

} catch (saveError) {
  console.error('Review saving error:', saveError)
  alert(saveError.message || 'Could not save review.')
}


  } catch (error) {
    console.error('AI analysis error:', error)
    alert('Could not connect to the server.')
  }
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

setReviewHistory(prev => [newReview, ...prev])

  // Save the review to MySQL through Flask
  try {
    const response = await apiFetch('/api/reviews', {
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

const statsHistory = displayedHistory.filter(item => {
  if (selectedPeriod === 'All time') return true

  const days = selectedPeriod === 'Last 7 days' ? 7
    : selectedPeriod === 'Last 30 days' ? 30
    : 90

  const reviewedDate = new Date(item.reviewedAt)

  if (isNaN(reviewedDate.getTime())) return false

  const now = new Date()
  const cutoff = new Date()
  cutoff.setDate(now.getDate() - days)

  return reviewedDate >= cutoff && reviewedDate <= now
})


function downloadReviewReport(item) {
  const report = `
INKLOOM AI - REVIEW REPORT
================================

Brand: ${item.brandName}
Review ID: ${item.id}
Reviewed At: ${item.reviewedAt}
Status: ${item.status}

Compliance Score: ${item.score}%
Issues Found: ${item.issues}

CONTENT REVIEWED
--------------------------------
${item.content}

REVIEWER FEEDBACK
--------------------------------
${item.reviewerFeedback || 'No reviewer feedback provided.'}

================================
Generated by INKLOOM AI
Create Freely. Stay On Brand.
`;

  const blob = new Blob([report], {
    type: 'text/plain;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `INKLOOM-Review-${item.id}.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}


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

  if (authLoading) {
    return <div className="auth-loading">Loading INKLOOM AI...</div>
  }


  if (!authUser) {
    return (
      <main className="auth-layout">
        <section className="auth-brand-panel">
          <div className="auth-brand-logo">
            <div className="auth-logo-symbol">I</div>
            <div>
              <h2>INKLOOM AI</h2>
              <span>BRAND GOVERNANCE</span>
            </div>
          </div>

          <div className="auth-brand-copy">
            <h1>
              Create Freely.<br />
              Stay On <span>Brand.</span>
            </h1>
            <p>
              Keep every message consistent, every visual aligned,
              and every piece of content true to your brand identity.
            </p>
          </div>

          <div className="auth-illustration">
            <div className="auth-orbit auth-orbit-one" />
            <div className="auth-orbit auth-orbit-two" />
            <div className="auth-shield">
              <ShieldCheck size={112} strokeWidth={1.2} />
            </div>
            <div className="auth-floating auth-float-one">
              <FileText size={28} />
            </div>
            <div className="auth-floating auth-float-two">
              <Sparkles size={28} />
            </div>
            <div className="auth-floating auth-float-three">
              <CheckCircle2 size={28} />
            </div>
          </div>

          <div className="auth-brand-footer">
            Intelligent brand governance, designed for creativity.
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-card-heading">
              <h2>INKLOOM AI</h2>
              <p>Brand Governance</p>
              <span />
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
              onClick={() => {
  setAuthMode('login')
  setAuthName('')
  setAuthEmail('')
  setAuthPassword('')
  setAuthError('')
}}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'active' : ''}
               onClick={() => {
  setAuthMode('register')
  setAuthName('')
  setAuthEmail('')
  setAuthPassword('')
  setAuthError('')
}}
              >
                Register
              </button>
            </div>

           <form onSubmit={handleAuthSubmit} autoComplete="off">
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={authName}
                  onChange={event => setAuthName(event.target.value)}
                  required
                />
              )}

              <input
                type="email"
                placeholder="Email address"
                value={authEmail}
                onChange={event => setAuthEmail(event.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password (minimum 8 characters)"
                value={authPassword}
                onChange={event => setAuthPassword(event.target.value)}
                minLength={8}
                required
              />

              {authError && (
                <p className="auth-error">{authError}</p>
              )}

              <button type="submit" className="auth-submit">
                {authMode === 'register' ? 'Create Account' : 'Login'}
                <ArrowUpRight size={19} />
              </button>
            </form>

            {authMode === 'login' && (
             
<div className="demo-access">
  <strong>Demo Account</strong>
  <span>Email: demo2026@inkloom.ai</span>
  <span>Password: InkloomDemo2026!</span>

  <button
    type="button"
    onClick={handleDemoLogin}
  >
    Use Demo Account
    <ArrowUpRight size={17} />
  </button>
</div>

            )}

            <p className="auth-switch">
              {authMode === 'register'
                ? 'Already have an account?'
                : "Don't have an account?"}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'register' ? 'login' : 'register')
                  setAuthError('')
                }}
              >
                {authMode === 'register' ? 'Login' : 'Register'}
              </button>
            </p>
          </div>
        </section>
      </main>
    )
  }


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

      <div className="workspace-wrapper">
  <button
    type="button"
    className="workspace"
    onClick={() => setWorkspaceOpen(!workspaceOpen)}
  >
    <span className="workspace-dot"></span>
    My Workspace
    <ChevronDown size={15} />
  </button>

  {workspaceOpen && (
    <div className="workspace-dropdown">
      <p>Current workspace</p>
      <strong>{profileName || 'INKLOOM Demo'}</strong>
      <span>{profileEmail}</span>
    </div>
  )}
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
          <button
  type="button"
  className="nav-item"
  onClick={() => setActive('Settings')}
>
  <Settings size={19} />
  Settings
</button>
        <div className="profile">
  <div className="avatar">
    {authUser?.name?.charAt(0).toUpperCase() || 'U'}
  </div>
  <div>
    <strong>{authUser?.name}</strong>
    <small>{authUser?.email}</small>
  </div>
  <button type="button" onClick={handleLogout}>
    Logout
  </button>
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

{notificationsOpen && (
  <div className="notification-panel">
    <h3>Notifications</h3>
    <p>You’re all caught up!</p>
  </div>
)}
<div className="notification-wrapper">
  <button
    type="button"
    className="icon-button"
    onClick={() => setNotificationsOpen(!notificationsOpen)}
    title="Notifications"
  >
    <Bell size={19} />
  </button>

  {notificationsOpen && (
    <div className="notification-panel">
      <h3>Notifications</h3>
      <p>You're all caught up!</p>
    </div>
  )}
</div>
          <button
  type="button"
  className="avatar"
  onClick={() => setActive('Profile')}
  title="Open Profile"
>
  I
</button>
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
<select
  className="period-button"
  value={selectedPeriod}
  onChange={(e) => setSelectedPeriod(e.target.value)}
>
  <option value="Last 7 days">Last 7 days</option>
  <option value="Last 30 days">Last 30 days</option>
  <option value="Last 90 days">Last 90 days</option>
  <option value="All time">All time</option>
</select>
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
{analysisResult.summary && (
  <p className="analysis-summary">
    {analysisResult.summary}
  </p>
)}

<div className="compliance-score">
  <span>{analysisResult.score}%</span>
  <p>AI compliance score</p>
</div>

    <div className="issues-section">
      <h3>Detected Issues</h3>

      {analysisResult.issues.length > 0 ? (
        <ul>
   {analysisResult.issues.map((issue, index) => (
  <li key={index} className="issue-card">
    <div>
      <AlertTriangle size={16} />
      <strong>{issue.phrase}</strong>
      <span className={`severity-${issue.severity?.toLowerCase()}`}>
        {issue.severity}
      </span>
    </div>

    <p><strong>Guideline:</strong> {issue.guideline}</p>
    <p><strong>Why it matters:</strong> {issue.explanation}</p>
    <p><strong>Suggested correction:</strong> {issue.suggestion}</p>
  </li>
))}
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
<ImageReview
  revisionReviewId={revisionType === 'image' ? revisionReviewId : null}
  onRevisionComplete={() => {
    setRevisionReviewId(null)
    setRevisionType(null)
    alert('Image revised and resubmitted successfully!')
  }}
/>

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
  <section className="page-panel history-page">
    <p className="eyebrow">AUDIT TRAIL</p>
    <h1>Review History</h1>
    <p className="subtitle">
      Track content checks and governance activity.
    </p>

    {displayedHistory.length > 0 ? (
      <div className="history-list">
        {displayedHistory.map((item) => (
          <article className="history-card" key={item.id}>
            <div className="history-card-header">
              <div>
                <h3>{item.brandName}</h3>
                <p>{item.reviewedAt}</p>
              </div>

              <span
                className={`history-status ${
                  item.status === 'Approved'
                    ? 'status-approved'
                    : item.status === 'Pending Review' ||
                      item.status === 'Pending'
                    ? 'status-pending'
                    : 'status-changes'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="history-details">
              <div className="history-metric">
                <span>Compliance Score</span>
                <strong>{item.score}%</strong>
              </div>

              <div className="history-metric">
                <span>Issues Found</span>
                <strong>{item.issues}</strong>
              </div>
            </div>

            <details className="history-report">
              <summary>View full review report</summary>
             <div className="history-content">
  <pre>{item.content}</pre>

  {item.reviewerFeedback && (
    <div className="reviewer-feedback">
      <h4>Reviewer Feedback</h4>
      <p>{item.reviewerFeedback}</p>
    </div>
  )}
</div>
            </details>

<button
  type="button"
  className="secondary-button"
  onClick={() => downloadReviewReport(item)}
>
  <FileText size={17} />
  Download Report
</button>
            {item.status === 'Needs Changes' && (
  <button
    className="primary-button"
    onClick={() => handleReviseReview(item)}
  >
    Revise & Resubmit
  </button>
)}
          </article>
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




{active === 'Profile' && (
  <section className="page-panel profile-page">
    <div className="profile-brand">
      <div className="profile-brand-icon">I</div>
      <div>
        <strong>INKLOOM AI</strong>
        <small>BRAND GOVERNANCE</small>
      </div>
    </div>

    <h1>Profile</h1>
    <p className="subtitle">
      Manage your profile and account settings.
    </p>

    <div className="profile-section">
      <div className="profile-overview">
        <div className="profile-avatar">
          {authUser?.name?.charAt(0).toUpperCase() || 'U'}
        </div>

        <div className="profile-user-info">
          <h3>{authUser?.name}</h3>
          <p>{authUser?.email}</p>
          <span className="profile-active">
            ● Account active
          </span>
        </div>

        <button
          type="button"
          className="profile-edit-btn"
          onClick={() => {
            setProfileEditing(!profileEditing)
            setProfileMessage('')
          }}
        >
          {profileEditing ? 'Cancel' : 'Edit profile'}
        </button>
      </div>

      <div className="profile-divider" />

      <h3>Personal Information</h3>
      <p className="profile-description">
        Update your name and email.
      </p>

      <form onSubmit={handleProfileUpdate}>
        <div className="profile-fields">
          <div>
            <label>Full name</label>
            <input
              type="text"
              value={profileName}
              disabled={!profileEditing}
              onChange={event => setProfileName(event.target.value)}
              required
            />
          </div>

          <div>
            <label>Email address</label>
            <input
              type="email"
              value={profileEmail}
              disabled={!profileEditing}
              onChange={event => setProfileEmail(event.target.value)}
              required
            />
          </div>
        </div>

        {profileEditing && (
          <button type="submit" className="profile-save-btn">
            Save changes
          </button>
        )}
       

        {profileMessage && (
          <p className="profile-message">{profileMessage}</p>
        )}
      </form>

      <div className="profile-divider" />

      <h3>Security</h3>
      <p className="profile-description">
        Your account security information.
      </p>

      <div className="profile-security-row">
        <div>
          <strong>Password</strong>
          <p>Protected with secure password hashing.</p>
        </div>
        <span className="profile-security-label">
          Protected
        </span>
      </div>
    </div>
  </section>
)}
{active === 'Settings' && (
  <section className="page-panel profile-page">
    <div className="profile-brand">
      <div className="profile-brand-icon">I</div>
      <div>
        <strong>INKLOOM AI</strong>
        <small>BRAND GOVERNANCE</small>
      </div>
    </div>

    <h1>Settings</h1>
    <p className="subtitle">
      Manage your application preferences.
    </p>

    <div className="profile-section">
      <h3>Workspace</h3>
      <p className="profile-description">
        Your current workspace information.
      </p>

      <div className="profile-security-row">
        <div>
          <strong>Workspace name</strong>
          <p>INKLOOM Demo</p>
        </div>
      </div>

      <div className="profile-divider" />

      <h3>Account</h3>
      <p className="profile-description">
        Your account information.
      </p>

      <div className="profile-security-row">
        <div>
          <strong>Email address</strong>
          <p>{profileEmail}</p>
        </div>
      </div>

      <div className="profile-divider" />

      <h3>Appearance</h3>
      <p className="profile-description">
        INKLOOM AI currently uses its default appearance.
      </p>
    </div>
  </section>
)}


        </div>
      </main>
    </div>
  )
}

export default App
