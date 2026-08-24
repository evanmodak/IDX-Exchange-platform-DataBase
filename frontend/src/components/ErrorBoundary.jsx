import { Component } from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In a real production app this would report to an error-tracking
    // service (Sentry, etc). For now, log it so it's visible in dev tools.
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>
            This part of the page ran into an unexpected error. You can try
            again, or head back to the listings page.
          </p>
          <div className="error-boundary-actions">
            <button type="button" onClick={this.handleReset}>
              Try Again
            </button>
            <a href="/">Back to Listings</a>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="error-boundary-details">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
