import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#ff453a', background: '#0d0d15', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ff453a' }}>⚠️ Application Error Occurred</h2>
          <pre style={{ background: 'rgba(255, 69, 58, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 69, 58, 0.3)', whiteSpace: 'pre-wrap', color: '#fff' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <pre style={{ color: '#a2a2b5', marginTop: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
)
