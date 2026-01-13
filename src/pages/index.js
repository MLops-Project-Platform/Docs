import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  useEffect(() => {
    window.location.href = '/docs/getting-started/overview';
  }, []);

  return (
    <Layout title="MLOps Platform Documentation">
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>MLOps Platform Documentation</h1>
        <p>Redirecting to Getting Started...</p>
        <p>
          If you are not redirected automatically, click{' '}
          <Link to="/docs/getting-started/overview">here</Link>.
        </p>
      </div>
    </Layout>
  );
}
