import React from 'react';
import { Alert } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px' }}>
          <Alert
            message="Component Error"
            description={
              <div>
                <p>There was an error loading this component. This is likely due to a React 19 compatibility issue with ApexCharts.</p>
                <p><strong>To fix this, run:</strong></p>
                <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                  cd frontend{'\n'}
                  npm install react-apexcharts@latest apexcharts@latest --legacy-peer-deps
                </pre>
                <p>Then restart the development server.</p>
                <details>
                  <summary style={{ cursor: 'pointer', color: '#1890ff' }}>Technical Details</summary>
                  <pre style={{ marginTop: '10px', fontSize: '12px' }}>
                    {this.state.error?.toString()}
                  </pre>
                </details>
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
