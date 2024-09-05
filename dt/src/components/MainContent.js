import React from 'react';

function MainContent() {
  return (
    <main className="main-content">
      <h2>공정 현황</h2>
      <div className="chart-space">
        {/* 차트가 들어갈 공간입니다. */}
      </div>
      <div className="info-section">
        <div className="info-card">공정 1</div>
        <div className="info-card">공정 2</div>
        <div className="info-card">공정 3</div>
      </div>
    </main>
  );
}

export default MainContent;
