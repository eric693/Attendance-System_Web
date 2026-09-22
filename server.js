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
const systemPrompt = `你是「出勤管家」的專業客服助理。你需要友善、專業地回答關於產品的問題。

產品資訊：
- 出勤管家是一個 LINE 打卡考勤系統
- 提供三種方案：
  * 方案A｜打卡方案 - $5,000（打卡、請假）
  * 方案B｜打卡+簽核 - $10,800（打卡、請假、簽核）
  * 方案C｜計薪方案 - $20,500（全功能+自動計薪）
- 買斷制，不限使用人數
- 7天退款保證
- 打卡：LINE 登入、GPS 定位打卡（地點範圍檢查）、QR Code 打卡、LINE Bot 打卡、指紋／臉部辨識確認、補打卡（需審核）、遲到早退與忘記打卡提醒
- 申請與審核：加班申請（平日／休息日／例假日／國定假日分別計費）、請假（15 種假別、額度管理、時數自動計算）、工作日誌、附件上傳（圖片或 PDF）
- 排班：單筆新增、批次匯入、月曆檢視、時數統計，影響早退判定與薪資計算
- 薪資：月薪／時薪自動計算、加班費、請假扣薪、早退扣款、勞健保級距、所得稅、自訂津貼與扣款、批次計算、三節獎金、薪資單簽收、薪資異動記錄、Excel 報表
- 管理：公告、角色管理（管理員／排班人員／員工）、打卡地點設定、離職處理、出勤分析圖表
- 系統：7 種語言（繁中、英、日、韓、越、泰、印尼）、可安裝到手機（PWA）、LINE 通知

聯絡方式：
- Email: erictechoffical@gmail.com
- Instagram: @tw.eric_technology
- LINE: @438tljso（https://line.me/R/ti/p/@438tljso）

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