import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import styled from 'styled-components';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App.css';

const MainTitleText = styled.p`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
`;

const MenuButton = styled.button`
  margin: 5px;
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ChartCard = styled.div`
  width: 80%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px; /* 명시적인 높이 지정 */
`;

function App() {
  const [activeChart, setActiveChart] = useState('highUrgency');
  const [highUrgencyData, setHighUrgencyData] = useState([]);
  const [mediumUrgencyData, setMediumUrgencyData] = useState([]);
  const [lowUrgencyData, setLowUrgencyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [urgencyData, setUrgencyData] = useState([]);
  const [importanceData, setImportanceData] = useState([]);

  useEffect(() => {
    const readExcel = async () => {
      try {
        const response = await fetch('/data/2_data.xlsx');
        if (!response.ok) {
          throw new Error(`네트워크 응답에 문제가 있습니다. 상태 코드: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', raw: true });

        const p1Data = workbook.Sheets['P1 설계변경요청'] ? XLSX.utils.sheet_to_json(workbook.Sheets['P1 설계변경요청']) : [];
        const p2Data = workbook.Sheets['P2 설계변경요청'] ? XLSX.utils.sheet_to_json(workbook.Sheets['P2 설계변경요청']) : [];
        const p3Data = workbook.Sheets['P3 설계변경요청'] ? XLSX.utils.sheet_to_json(workbook.Sheets['P3 설계변경요청']) : [];

        const combinedData = [...p1Data, ...p2Data, ...p3Data];

        combinedData.forEach(item => {
          if (item) {
            item['등록일'] = item['등록일'] ? new Date(item['등록일']) : null;
            item['완료예정일'] = item['완료예정일'] ? new Date(item['완료예정일']) : null;
            item['조치완료일'] = item['조치완료일'] ? new Date(item['조치완료일']) : null;
          }
        });

        const urgencyCount = combinedData.reduce((acc, item) => {
          const urgency = item['긴급도'];
          const status = item['진행상태'] || '상태 없음';
          
          if (!acc[urgency]) {
            acc[urgency] = {
              '계획완료': 0,
              '담당자지정': 0,
              '등록취소': 0,
              '반려': 0,
              '완료': 0,
              '진행중': 0,
              '상태 없음': 0,
            };
          }
          
          acc[urgency][status] = (acc[urgency][status] || 0) + 1;
          return acc;
        }, {});

        const formatData = (data) =>
          Object.keys(data).map((key) => ({
            id: key,
            label: key,
            value: data[key],
          }));

        setHighUrgencyData(formatData(urgencyCount['상'] || {}));
        setMediumUrgencyData(formatData(urgencyCount['중'] || {}));
        setLowUrgencyData(formatData(urgencyCount['하'] || {}));

        const statusCounts = combinedData.reduce((acc, item) => {
          const status = item['진행상태'] || '상태 없음';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        setStatusData(Object.keys(statusCounts).map(key => ({ id: key, label: key, value: statusCounts[key] })));

        const urgencyCounts = combinedData.reduce((acc, item) => {
          const urgency = item['긴급도'] || '긴급도 없음';
          acc[urgency] = (acc[urgency] || 0) + 1;
          return acc;
        }, {});
        setUrgencyData(Object.keys(urgencyCounts).map(key => ({ id: key, value: urgencyCounts[key] })));

        const importanceCounts = combinedData.reduce((acc, item) => {
          const importance = item['중요도'] || '중요도 없음';
          acc[importance] = (acc[importance] || 0) + 1;
          return acc;
        }, {});
        setImportanceData(Object.keys(importanceCounts).map(key => ({ id: key, value: importanceCounts[key] })));

      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert(`오류가 발생했습니다: ${error.message}`);
      }
    };

    readExcel();
  }, []);

  const renderChart = () => {
    switch (activeChart) {
      case 'highUrgency':
        return (
          <ChartCard>
            <MainTitleText></MainTitleText>
            {highUrgencyData.length > 0 ? (
              <ResponsivePie
                data={highUrgencyData}
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
          </ChartCard>
        );
      case 'mediumUrgency':
        return (
          <ChartCard>
            <MainTitleText></MainTitleText>
            {mediumUrgencyData.length > 0 ? (
              <ResponsivePie
                data={mediumUrgencyData}
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
          </ChartCard>
        );
      case 'lowUrgency':
        return (
          <ChartCard>
            <MainTitleText></MainTitleText>
            {lowUrgencyData.length > 0 ? (
              <ResponsivePie
                data={lowUrgencyData}
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
          </ChartCard>
        );
      case 'status':
        return (
          <ChartCard>
            <MainTitleText></MainTitleText>
            {statusData.length > 0 ? (
              <ResponsivePie
                data={statusData}
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
          </ChartCard>
        );
      case 'urgencyImportance':
        return (
          <ChartCard>
            <MainTitleText></MainTitleText>
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
          </ChartCard>
        );
      default:
        return <p>차트를 선택해 주세요.</p>;
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <h2>공정 현황</h2>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <MenuButton onClick={() => setActiveChart('highUrgency')}>상 긴급도 차트</MenuButton>
            <MenuButton onClick={() => setActiveChart('mediumUrgency')}>중 긴급도 차트</MenuButton>
            <MenuButton onClick={() => setActiveChart('lowUrgency')}>하 긴급도 차트</MenuButton>
            <MenuButton onClick={() => setActiveChart('status')}>진행상태 차트</MenuButton>
            <MenuButton onClick={() => setActiveChart('urgencyImportance')}>긴급도/중요도 차트</MenuButton>
          </div>
          {renderChart()}
        </main>
      </div>
    </div>
  );
}

export default App;
