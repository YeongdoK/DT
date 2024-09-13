import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import styled from 'styled-components';
import { Accordion, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Styled-components
const ChartCard = styled.div`
  width: 90%;
  max-width: 900px;
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
  height: 600px;
`;

const MainTitleText = styled.p`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
`;

// 상위 N개의 데이터만 표시하고 나머지를 "기타"로 묶는 함수
const getTopNData = (data, key, n = 10) => {
  const sortedData = [...data].sort((a, b) => b[key] - a[key]);
  const topNData = sortedData.slice(0, n);
  const otherDataCount = sortedData.slice(n).reduce((acc, item) => acc + item[key], 0);

  if (otherDataCount > 0) {
    topNData.push({ [Object.keys(data[0])[0]]: '기타', [key]: otherDataCount });
  }

  return topNData;
};

// 연도별 프로젝트 수 렌더링 (애니메이션 추가)
const renderYearlyChart = (data, title) => (
  <ChartCard>
    <MainTitleText>{title}</MainTitleText>
    {data.length > 0 ? (
      <ResponsiveLine
        data={[
          {
            id: "Yearly Projects",
            data: data.map(item => ({ x: item.year, y: item.count })),
          },
        ]}
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: true,
          reverse: false,
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '연도',
          legendOffset: 36,
          legendPosition: 'middle',
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '프로젝트 수',
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        colors={{ scheme: 'category10' }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        animate={true}  // 애니메이션 활성화
        motionConfig="wobbly" // 더 눈에 띄는 애니메이션 설정
        isInteractive={true}  // 인터랙티브 모션 사용
        enableSlices="x"      // 마우스 오버 시 슬라이스 애니메이션
      />
    ) : (
      <p>데이터를 불러오는 중입니다...</p>
    )}
  </ChartCard>
);


// 부서별 출도 수 렌더링 (상위 10개 부서와 나머지 "기타"로 묶기)
const renderDepartmentChart = (data, title) => {
  const topData = getTopNData(data, 'count', 10); // 상위 10개 항목만 표시

  return (
    <ChartCard>
      <MainTitleText>{title}</MainTitleText>
      {topData.length > 0 ? (
        <ResponsiveBar
          data={topData}
          keys={['count']}
          indexBy="release_department"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          colors={{ scheme: 'pastel1' }}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '부서',
            legendPosition: 'middle',
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '출도 수',
            legendPosition: 'middle',
            legendOffset: -40,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />
      ) : (
        <p>데이터를 불러오는 중입니다...</p>
      )}
    </ChartCard>
  );
};

// 원인코드별 발생빈도 차트 렌더링 함수 (많은 순으로 정렬)
const renderCauseFrequencyChart = (data, title) => {
  const sortedData = [...data].sort((a, b) => b.count - a.count); // 발생 빈도수를 기준으로 내림차순 정렬

  return (
    <ChartCard>
      <MainTitleText>{title}</MainTitleText>
      {sortedData.length > 0 ? (
        <ResponsiveBar
          data={sortedData}
          keys={['count']}
          indexBy="cause_code"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          colors={{ scheme: 'set2' }}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 45,
            legend: '원인코드',
            legendPosition: 'middle',
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '발생 빈도수',
            legendPosition: 'middle',
            legendOffset: -40,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />
      ) : (
        <p>데이터를 불러오는 중입니다...</p>
      )}
    </ChartCard>
  );
};

const App = () => {
  const [yearlyData, setYearlyData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [causeFrequencyData, setCauseFrequencyData] = useState([]);
  const [activeChart, setActiveChart] = useState(null);

  useEffect(() => {
    // 연도별 프로젝트 수 데이터 가져오기
    const fetchYearlyProjects = async () => {
      try {
        const response = await axios.get("http://localhost:3030/yearly-projects");
        setYearlyData(response.data.data);
      } catch (error) {
        console.error("Error fetching yearly projects:", error);
      }
    };

    // 부서별 출도 수 데이터 가져오기
    const fetchDepartmentCount = async () => {
      try {
        const response = await axios.get("http://localhost:3030/department-count");
        setDepartmentData(response.data.data);
      } catch (error) {
        console.error("Error fetching department count:", error);
      }
    };

    // 원인코드별 발생빈도 데이터 가져오기
    const fetchCauseFrequency = async () => {
      try {
        const response = await axios.get("http://localhost:3030/cause-frequency");
        setCauseFrequencyData(response.data.data);
      } catch (error) {
        console.error("Error fetching cause frequency:", error);
      }
    };

    // 데이터를 가져오는 함수를 호출
    fetchYearlyProjects();
    fetchDepartmentCount();
    fetchCauseFrequency();
  }, []);

  // 차트를 렌더링하는 함수
  const renderChart = () => {
    switch (activeChart) {
      case 'yearly':
        return renderYearlyChart(yearlyData, "연도별 프로젝트 수");
      case 'department':
        return renderDepartmentChart(departmentData, "부서별 출도 수");
      case 'causeFrequency':
        return renderCauseFrequencyChart(causeFrequencyData, "원인코드별 발생빈도");
      default:
        return <p>차트를 선택해 주세요.</p>;
    }
  };

  return (
    <div className="App">
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>개정도 현황</Accordion.Header>
          <Accordion.Body>
            <ul>
              <li>
                <Button
                  variant="link"
                  onClick={() => setActiveChart('yearly')}
                >
                  연도별 프로젝트 수
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  onClick={() => setActiveChart('department')}
                >
                  부서별 출도 수
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  onClick={() => setActiveChart('causeFrequency')}
                >
                  원인코드별 발생 빈도
                </Button>
              </li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      {renderChart()}
    </div>
  );
};

export default App;
