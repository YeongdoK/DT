import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import styled from 'styled-components';

const MainTitleText = styled.p`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
`;

function LowUrgencyChart({ data }) {
  return (
    <div style={{ height: 400, width: 400 }}>
      <MainTitleText>하 긴급도</MainTitleText>
      {data.length > 0 ? (
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={{ scheme: 'nivo' }}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
        />
      ) : (
        <p>데이터를 불러오는 중입니다...</p>
      )}
    </div>
  );
}

export default LowUrgencyChart;
