// server.js
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: '*',  // 允許所有來源
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // 從環境變數讀取
});

// 聊天機器人知識庫（用於 system prompt）
const systemPrompt = `你是「打卡救星」的專業客服助理。你需要友善、專業地回答關於產品的問題。

產品資訊：
- 打卡救星是一個 LINE 打卡考勤系統
- 提供三種方案：
  * 方案A｜打卡方案 - $2,400（打卡、請假）
  * 方案B｜打卡+簽核 - $8,800（打卡、請假、簽核）
  * 方案C｜計薪方案 - $16,300（全功能+自動計薪）
- 買斷制，不限使用人數
- 7天退款保證
- 支援 GPS/IP 定位打卡
- 防止代打卡機制

聯絡方式：
- Email: exo881222@gmail.com
- Instagram: @tw.eric_technology

請用繁體中文回答，保持專業且友善的語氣。`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 或使用 gpt-4o
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = completion.choices[0].message.content;

    res.json({ 
      success: true, 
      reply: reply 
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: '抱歉，系統暫時無法回應，請稍後再試。' 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});