import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import './App.css';

const MainTitleText = styled.p`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
`;

const ChartCard = styled.div`
  flex: 1;
  max-width: calc(100% - 250px); /* Adjusts the size based on sidebar */
  margin: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px;
`;

const Sidebar = styled.div`
  width: 250px;
  min-width: 250px;
  background-color: #f4f4f4;
  padding: 20px;
  border-right: 1px solid #ddd;
`;

const Accordion = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

const AccordionHeader = styled.div`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
`;

const AccordionContent = styled.div`
  background-color: #f9f9f9;
  max-height: ${({ isOpen }) => (isOpen ? '300px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ListItem = styled.li`
  padding: 10px 20px;
  list-style: none;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const App = () => {
  const [activeChart, setActiveChart] = useState('highUrgency');
  const [accordionOpen, setAccordionOpen] = useState(true); // 아코디언을 기본으로 열림 상태로 설정
  const [highUrgencyData, setHighUrgencyData] = useState([]);
  const [mediumUrgencyData, setMediumUrgencyData] = useState([]);
  const [lowUrgencyData, setLowUrgencyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [urgencyImportanceData, setUrgencyImportanceData] = useState([]);

  const fetchData = useCallback(async (url, setData) => {
    try {
      const response = await axios.get(url, {
        params: { limit: 50 }
      });
      console.log(`Fetched data from ${url}:`, response.data.data);
      setData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  }, []);

  useEffect(() => {
    fetchData('http://localhost:3030/urgency?level=상', setHighUrgencyData);
    fetchData('http://localhost:3030/urgency?level=중', setMediumUrgencyData);
    fetchData('http://localhost:3030/urgency?level=하', setLowUrgencyData);
    fetchData('http://localhost:3030/status', setStatusData);
    fetchData('http://localhost:3030/urgencyImportance', setUrgencyImportanceData);
  }, [fetchData]);

  const groupData = (data, groupBy) => {
    if (!data || data.length === 0) {
      console.log("No data available for grouping");
      return [];
    }
    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy] || 'Unknown';
      if (!acc[key]) {
        acc[key] = { id: key, label: key, value: 0 };
      }
      acc[key].value += 1;
      return acc;
    }, {});
    console.log("Grouped data:", grouped);
    return Object.values(grouped);
  };

  const highUrgencyChartData = useMemo(() => {
    return groupData(highUrgencyData, 'status_ongoing');
  }, [highUrgencyData]);

  const mediumUrgencyChartData = useMemo(() => {
    return groupData(mediumUrgencyData, 'status_ongoing');
  }, [mediumUrgencyData]);

  const lowUrgencyChartData = useMemo(() => {
    return groupData(lowUrgencyData, 'status_ongoing');
  }, [lowUrgencyData]);

  const statusChartData = useMemo(() => {
    const statusCounts = statusData.reduce((acc, item) => {
      const status = item.status || item.status_ongoing || 'Unknown';
      acc[status] = (acc[status] || 0) + (item.count || 1);
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([key, value]) => ({
      id: key,
      label: key,
      value: value
    }));
  }, [statusData]);

  const urgencyImportanceChartData = useMemo(() => {
    const urgencyCounts = [
      { id: '상', 긴급도: highUrgencyData.length, 중요도: 0 },
      { id: '중', 긴급도: mediumUrgencyData.length, 중요도: 0 },
      { id: '하', 긴급도: lowUrgencyData.length, 중요도: 0 }
    ];

    urgencyImportanceData.forEach(item => {
      const importanceMapping = {
        High: '상',
        Medium: '중',
        Low: '하'
      };

      const importance = importanceMapping[item.importance_level];

      if (importance) {
        const index = urgencyCounts.findIndex(data => data.id === importance);
        if (index !== -1) {
          urgencyCounts[index].중요도 += item.count || 1;
        }
      }
    });

    console.log('Urgency and Importance Data:', urgencyCounts);
    return urgencyCounts;
  }, [highUrgencyData, mediumUrgencyData, lowUrgencyData, urgencyImportanceData]);

  const pastelColors1 = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"];
  const pastelColors2 = ["#FFCCF9", "#C4EFFF", "#FFABAB", "#FFC3A0", "#FF677D"];
  const pastelColors3 = ["#C5C6FF", "#FFC5D0", "#D4A5A5", "#B5EAD7", "#FFDAC1"];
  const pastelColors4 = ["#FFB7B2", "#FFDAC1", "#E2F0CB", "#C1E1DC", "#C3C1E1"];

  const renderPieChart = (data, title, colors) => (
    <ChartCard>
      <MainTitleText>{title}</MainTitleText>
      {data.length > 0 ? (
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.7}
          padAngle={0.8}
          cornerRadius={4}
          activeOuterRadiusOffset={10}
          colors={colors}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          animate={true}
          motionConfig="gentle"
        />
      ) : (
        <p>데이터를 불러오는 중입니다...</p>
      )}
    </ChartCard>
  );

  const renderBarChart = (data, title, colors) => (
    <ChartCard>
      <MainTitleText>{title}</MainTitleText>
      {data.length > 0 ? (
        <ResponsiveBar
          data={data}
          keys={['긴급도', '중요도']}
          indexBy="id"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          groupMode="grouped"
          colors={colors}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
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
          animate={true}
          motionConfig="gentle"
        />
      ) : (
        <p>데이터를 불러오는 중입니다...</p>
      )}
    </ChartCard>
  );

  const renderChart = () => {
    switch (activeChart) {
      case 'highUrgency':
        return renderPieChart(highUrgencyChartData, '상 긴급도 차트', pastelColors1);
      case 'mediumUrgency':
        return renderPieChart(mediumUrgencyChartData, '중 긴급도 차트', pastelColors2);
      case 'lowUrgency':
        return renderPieChart(lowUrgencyChartData, '하 긴급도 차트', pastelColors3);
      case 'status':
        return renderPieChart(statusChartData, '진행상태 차트', pastelColors4);
      case 'urgencyImportance':
        return renderBarChart(urgencyImportanceChartData, '긴급도/중요도 차트', pastelColors1);
      default:
        return <p>차트를 선택해 주세요.</p>;
    }
  };

  return (
    <Container>
      <Sidebar>
        <Accordion>
          <AccordionHeader onClick={() => setAccordionOpen(!accordionOpen)}>
            설계변경현황
          </AccordionHeader>
          <AccordionContent isOpen={accordionOpen}>
            <ul>
              <ListItem onClick={() => setActiveChart('highUrgency')}>상 긴급도 차트</ListItem>
              <ListItem onClick={() => setActiveChart('mediumUrgency')}>중 긴급도 차트</ListItem>
              <ListItem onClick={() => setActiveChart('lowUrgency')}>하 긴급도 차트</ListItem>
              <ListItem onClick={() => setActiveChart('status')}>진행상태 차트</ListItem>
              <ListItem onClick={() => setActiveChart('urgencyImportance')}>긴급도/중요도 차트</ListItem>
            </ul>
          </AccordionContent>
        </Accordion>
      </Sidebar>
      {renderChart()}
    </Container>
  );
}

export default App;
