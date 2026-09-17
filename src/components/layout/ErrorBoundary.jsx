import { Component } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StudyMate error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <AlertCircle size={32} />
          <h1>Something needs a refresh.</h1>
          <p>Your local study data is safe in your browser. Reload the page to continue.</p>
          <Button onClick={() => window.location.reload()}>Reload StudyMate</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
