import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import styled from 'styled-components';

const MainTitleText = styled.p`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
`;

function UrgencyImportanceBarChart({ urgencyData, importanceData }) {
  return (
    <div style={{ height: 400 }}>
      <MainTitleText>긴급도 및 중요도별 요청 수</MainTitleText>
      <ResponsiveBar
        data={[
          ...urgencyData.map((item) => ({ ...item, group: '긴급도' })),
          ...importanceData.map((item) => ({ ...item, group: '중요도' })),
        ]}
        keys={['value']}
        indexBy="id"
        groupMode="grouped"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        colors={{ scheme: 'nivo' }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '카테고리',
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '요청 수',
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
      />
    </div>
  );
}

export default UrgencyImportanceBarChart;
