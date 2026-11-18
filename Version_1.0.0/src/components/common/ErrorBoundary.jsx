import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Caught Error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', background: '#0a0d10', color: '#f87171', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
            ⚠️ Application Render Error Caught:
          </h2>
          <p style={{ marginTop: '12px', fontSize: '15px', color: '#fca5a5' }}>
            {this.state.error?.toString()}
          </p>
          <pre style={{ marginTop: '16px', background: '#171c22', padding: '16px', borderRadius: '12px', overflowX: 'auto', fontSize: '12px', color: '#cbd5e1' }}>
            {this.state.error?.stack}
          </pre>
          {this.state.errorInfo && (
            <pre style={{ marginTop: '16px', background: '#171c22', padding: '16px', borderRadius: '12px', overflowX: 'auto', fontSize: '12px', color: '#94a3b8' }}>
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', background: '#a3e635', color: '#090c0f', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
