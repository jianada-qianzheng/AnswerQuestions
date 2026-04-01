import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // 限制只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只允许 POST 请求' });
    }

    const { context, question } = req.body;

    if (!context || !question) {
        return res.status(400).json({ error: '请提供参考文本和问题' });
    }

    try {
        // 从 Vercel 的环境变量中安全读取 API Key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `你是一个精准的阅读理解助手。请严格根据以下【参考文本】来回答【问题】。\n如果你在参考文本中找不到答案，请明确告知用户。\n\n【参考文本开始】\n${context}\n【参考文本结束】\n\n【问题】：${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 将结果返回给前端
        res.status(200).json({ answer: text });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'AI 生成内容失败，请检查服务器日志或 API Key。' });
    }
}
