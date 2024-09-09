let chart;
let combinedData = []; // 전역 변수로 데이터 저장

// 엑셀 데이터 최초 한번 로드
async function loadData() {
    try {
        const response = await fetch('./data/2_data.xlsx');
        if (!response.ok) {
            throw new Error(`네트워크 응답에 문제가 있습니다. 상태 코드: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // 엑셀 시트에서 데이터 추출
        const p1Data = workbook.Sheets['P1 설계변경요청'] ? XLSX.utils.sheet_to_json(workbook.Sheets['P1 설계변경요청']) : [];
        const p2Data = workbook.Sheets['P2 설계변경요청'] ? XLSX.utils.sheet_to_json(workbook.Sheets['P2 설계변경요청']) : [];
        const p3Data = workbook.Sheets['P3 설계변경요청'] ? XLSX.utils.sheet_to_json(workbook.Sheets['P3 설계변경요청']) : [];
        combinedData = [...p1Data, ...p2Data, ...p3Data]; // 전역 변수에 저장

        combinedData.forEach(item => {
            if (item) {
                item['등록일'] = item['등록일'] ? new Date(item['등록일']) : null;
                item['완료예정일'] = item['완료예정일'] ? new Date(item['완료예정일']) : null;
                item['조치완료일'] = item['조치완료일'] ? new Date(item['조치완료일']) : null;
            }
        });

        console.log('Loaded Data:', combinedData); // 데이터 로드 확인
    } catch (error) {
        console.error('Error reading Excel file:', error);
        alert(`오류가 발생했습니다: ${error.message}`);
    }
}

// 기존 데이터를 사용해 차트 데이터 형식으로 변환
function formatChartData(data, type) {
    switch (type) {
        case 'highUrgency':
        case 'mediumUrgency':
        case 'lowUrgency':
            const urgencyLevel = {
                highUrgency: '상',
                mediumUrgency: '중',
                lowUrgency: '하'
            }[type];
            
            const filteredData = data.filter(item => item['긴급도'] === urgencyLevel);
            const urgencyStatusCounts = filteredData.reduce((acc, item) => {
                const status = item['진행상태'] || '상태 없음';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            const statusLabels = Object.keys(urgencyStatusCounts);
            const statusData = statusLabels.map(label => urgencyStatusCounts[label]);

            console.log(`Urgency (${urgencyLevel}) Status Data:`, urgencyStatusCounts); // 디버깅을 위한 로그

            return {
                labels: statusLabels,
                datasets: [{
                    label: `진행 상태 (${urgencyLevel} 긴급도)`,
                    data: statusData,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
                }]
            };

        case 'urgencyImportance':
            const urgencyCounts = data.reduce((acc, item) => {
                const urgency = item['긴급도'] || '긴급도 없음';
                acc[urgency] = (acc[urgency] || 0) + 1;
                return acc;
            }, {});

            const importanceCounts = data.reduce((acc, item) => {
                const importance = item['중요도'] || '중요도 없음';
                acc[importance] = (acc[importance] || 0) + 1;
                return acc;
            }, {});

            const labels = ['상', '중', '하', 'High', 'Medium', 'Low'];
            const urgencyData = labels.map(label => urgencyCounts[label] || 0);
            const importanceData = labels.map(label => importanceCounts[label] || 0);

            console.log('Urgency and Importance Data:', urgencyCounts, importanceCounts); // 디버깅을 위한 로그

            return {
                labels,
                datasets: [
                    {
                        label: '긴급도',
                        data: urgencyData,
                        backgroundColor: '#FF6384',
                        barThickness: 'flex'
                    },
                    {
                        label: '중요도',
                        data: importanceData,
                        backgroundColor: '#36A2EB',
                        barThickness: 'flex'
                    }
                ]
            };

        case 'progressStatus':
            const progressStatusCounts = data.reduce((acc, item) => {
                const status = item['진행상태'] || '상태 없음';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            const progressStatusLabels = Object.keys(progressStatusCounts);
            const progressStatusData = progressStatusLabels.map(label => progressStatusCounts[label]);

            console.log('Progress Status Data:', progressStatusCounts); // 진행 상태 데이터 확인

            if (progressStatusLabels.length === 0 || progressStatusData.length === 0) {
                console.warn('No data available for progress status chart');
            }

            return {
                labels: progressStatusLabels,
                datasets: [{
                    label: '진행상태',
                    data: progressStatusData,
                    backgroundColor: ['#D5FF00', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
                }]
            };

        default:
            console.error(`Unexpected chart type: ${type}`);
            return {
                labels: [],
                datasets: []
            };
    }
}

// 차트를 생성하거나 업데이트
function createChart(data, type) {
    const ctx = document.getElementById('myChart').getContext('2d');

    // 기존 차트가 있다면 파괴 후 새로 생성
    if (chart) {
        chart.destroy(); // 기존 차트 파괴
    }
    
    // 차트 생성
    chart = new Chart(ctx, {
        type: type === 'urgencyImportance' ? 'bar' : 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: getChartTitle(type) // 타입에 맞는 제목 설정
                }
            },
            scales: type === 'urgencyImportance' ? {
                x: {
                    title: {
                        display: true,
                        text: '카테고리'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0
                    },
                    barPercentage: 0.8,
                    categoryPercentage: 0.9,
                    stacked: true
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '수량'
                    }
                }
            } : {}
        }
    });
}

// 차트 제목 설정 함수
function getChartTitle(type) {
    switch (type) {
        case 'progressStatus':
            return '차트: 진행상태';
        case 'highUrgency':
            return '차트: High Urgency';
        case 'mediumUrgency':
            return '차트: Medium Urgency';
        case 'lowUrgency':
            return '차트: Low Urgency';
        case 'urgencyImportance':
            return '긴급도/중요도 차트';
        default:
            return `차트: ${type}`;
    }
}

// 차트를 활성화하는 함수 (데이터 필터링 후 차트 업데이트)
function setActiveChart(type) {
    const validTypes = ['progressStatus', 'highUrgency', 'mediumUrgency', 'lowUrgency', 'urgencyImportance'];
    if (!validTypes.includes(type)) {
        console.error(`Unexpected chart type: ${type}`);
        return;
    }

    const formattedData = formatChartData(combinedData, type);
    createChart(formattedData, type);
}

// DOMContentLoaded 이벤트 핸들러 수정
document.addEventListener('DOMContentLoaded', async function() {
    await loadData(); // 데이터는 최초 로드만 실행
    setActiveChart('progressStatus'); // 기본 차트를 진행상황 차트로 설정

    // 버튼 이벤트 추가
    document.getElementById('highUrgencyButton').addEventListener('click', () => setActiveChart('highUrgency'));
    document.getElementById('mediumUrgencyButton').addEventListener('click', () => setActiveChart('mediumUrgency'));
    document.getElementById('lowUrgencyButton').addEventListener('click', () => setActiveChart('lowUrgency'));
    document.getElementById('progressStatusButton').addEventListener('click', () => setActiveChart('progressStatus'));
    document.getElementById('urgencyImportanceButton').addEventListener('click', () => setActiveChart('urgencyImportance'));
});
