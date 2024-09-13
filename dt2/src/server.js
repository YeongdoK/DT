const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3030;

app.use(cors({
  origin: "*", // 모든 출처 허용
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL 데이터베이스 연결 설정
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1111",
  database: "samsung_shipyard", // 데이터베이스 이름
});

conn.connect((err) => {
  if (err) {
    console.error("데이터베이스 연결 실패:", err);
    return;
  }
  console.log("데이터베이스에 연결되었습니다.");
});

// 기본 엔드포인트
app.get("/", (req, res) => {
  return res.json({
    error: false,
    message: "Welcome to the dashboard node js.",
  });
});

// 설계변경 현황 - 긴급도별 데이터 요청
app.get("/urgency", (req, res) => {
  const level = req.query.level; // '상', '중', '하' 중 하나
  conn.query(
    "SELECT * FROM request_design_change WHERE urgency_level = ?",
    [level],
    (error, results) => {
      if (error) {
        console.error("Database query error:", error);
        return res.status(500).json({
          error: true,
          message: "Internal Server Error",
        });
      }

      let message =
        results.length === 0
          ? `No data found for level ${level}`
          : `Successfully retrieved data for level ${level}`;
      return res.json({
        error: false,
        message: message,
        data: results,
      });
    }
  );
});

// 설계변경 현황 - 진행상태 차트 데이터 요청
app.get("/status", (req, res) => {
  conn.query(
    "SELECT status_ongoing, COUNT(*) as count FROM request_design_change GROUP BY status_ongoing",
    (error, results) => {
      if (error) {
        console.error("Database query error:", error);
        return res.status(500).json({
          error: true,
          message: "Internal Server Error",
        });
      }

      let message =
        results.length === 0
          ? "Status data is empty"
          : "Successfully retrieved all status data";
      return res.json({
        error: false,
        message: message,
        data: results,
      });
    }
  );
});

// 설계변경 현황 - 긴급도/중요도 차트 데이터 요청
app.get("/urgencyImportance", (req, res) => {
  conn.query(
    "SELECT urgency_level, importance_level, COUNT(*) as count FROM request_design_change GROUP BY urgency_level, importance_level",
    (error, results) => {
      if (error) {
        console.error("Database query error:", error);
        return res.status(500).json({
          error: true,
          message: "Internal Server Error",
        });
      }

      let message =
        results.length === 0
          ? "Urgency/Importance data is empty"
          : "Successfully retrieved all urgency/importance data";
      return res.json({
        error: false,
        message: message,
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
