import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <div className="card">
        <h3>Welcome to Bruno's IMS</h3>
        <p>
          This is the main dashboard where you can view key metrics and quick access to important
          features.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <div className="card">
            <h4>Total Restaurants</h4>
            <p style={{ fontSize: '2em', color: '#007bff' }}>0</p>
          </div>

          <div className="card">
            <h4>Active Users</h4>
            <p style={{ fontSize: '2em', color: '#28a745' }}>0</p>
          </div>

          <div className="card">
            <h4>Countries</h4>
            <p style={{ fontSize: '2em', color: '#ffc107' }}>0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
