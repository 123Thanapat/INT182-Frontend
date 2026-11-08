import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = 3000;

// ตั้งค่า CORS ให้เว็บ Frontend ของคุณเรียกใช้งานได้ (รองรับขนาดรูป Base64 ใหญ่ๆ ด้วย)
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Endpoint สำหรับรับรูปภาพจาก Frontend แล้วส่งต่อไปหา Roboflow
app.post("/api/detect", async (req, res) => {
  try {
    const { imageUrl } = req.body; // รับค่า imageUrl แทน

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl" });
    }

    const response = await fetch(
      "https://serverless.roboflow.com/-6ag9m/workflows/detect-ingredient3",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.ROBOFLOW_KEY,
        },
        body: JSON.stringify({
          inputs: {
            image: { type: "url", value: imageUrl }, // เปลี่ยนเป็น type: "url"
          },
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// เริ่มรัน Server
app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
});
