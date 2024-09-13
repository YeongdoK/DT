const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3030;

// CORS 설정 - 모든 출처 허용
app.use(cors({
  origin: "*",
}));

// JSON 파싱을 위한 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL 데이터베이스 연결 설정
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1111",
  database: "samsung_shipyard", // 데이터베이스 이름을 정확히 설정하세요
});

// MySQL 연결 확인
conn.connect((err) => {
  if (err) {
    console.error("데이터베이스 연결 실패:", err);
    return;
  }
  console.log("데이터베이스에 연결되었습니다.");
});

// 연도별 프로젝트 수 변화 데이터 요청
app.get("/yearly-projects", (req, res) => {
  conn.query(
    "SELECT YEAR(release_date) as year, COUNT(*) as count FROM status_revised_drawing GROUP BY YEAR(release_date) ORDER BY YEAR(release_date)",
    (error, results) => {
      if (error) {
        console.error("Database query error (yearly-projects):", error.message);
        return res.status(500).json({
          error: true,
          message: "Internal Server Error",
          details: error.message,
        });
      }

      console.log("Yearly Projects Query Results:", results); // 쿼리 결과를 출력하여 확인
      return res.json({
        error: false,
        message: "Successfully retrieved yearly projects data",
        data: results,
      });
    }
  );
});

// 월별 프로젝트 수 변화 데이터 요청
app.get("/monthly-projects", (req, res) => {
  conn.query(
    "SELECT DATE_FORMAT(release_date, '%Y-%m') as month, COUNT(*) as count FROM status_revised_drawing GROUP BY DATE_FORMAT(release_date, '%Y-%m') ORDER BY DATE_FORMAT(release_date, '%Y-%m')",
    (error, results) => {
      if (error) {
        console.error("Database query error (monthly-projects):", error.message);
        return res.status(500).json({
          error: true,
          message: "Internal Server Error",
          details: error.message,
        });
      }

      console.log("Monthly Projects Query Results:", results); // 쿼리 결과를 출력하여 확인
      return res.json({
        error: false,
        message: "Successfully retrieved monthly projects data",
        data: results,
      });
    }
  );
});

// 부서별 출도 수 데이터 요청
app.get("/department-count", (req, res) => {
  conn.query(
    "SELECT release_department, COUNT(*) as count FROM status_revised_drawing GROUP BY release_department",
    (error, results) => {
      if (error) {
        console.error("Database query error (department-count):", error.message);
        return res.status(500).json({
          error: true,
          message: "Internal Server Error",
          details: error.message,
        });
      }

      console.log("Department Count Query Results:", results); // 데이터 확인
      return res.json({
        error: false,
        message: "Successfully retrieved department count data",
        data: results,
      });
    }
  );
});

// 원인코드별 발생빈도 데이터 요청
app.get("/cause-frequency", (req, res) => {
  conn.query(
    "SELECT cause_code, COUNT(*) as count FROM status_revised_drawing GROUP BY cause_code",
    (error, results) => {
      if (error) {
        console.error("Database query error (cause-frequency):", error.message);
        return res.status(500).json({
          error: true,
          message: "Internal Server Error",
          details: error.message,
        });
      }

      console.log("Cause Frequency Query Results:", results); // 데이터 확인
      return res.json({
        error: false,
        message: "Successfully retrieved cause frequency data",
        data: results,
      });
    }
  );
});

// 서버 시작
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
