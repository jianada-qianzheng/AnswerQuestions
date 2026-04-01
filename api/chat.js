import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    const { context, question } = req.body;

    if (!context || !question) {
        return res.status(400).json({ error: 'Context and question are required.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a precise reading comprehension assistant. Answer the question based strictly on the provided context. If the answer is not in the context, explicitly state that you cannot find the answer in the provided text.\n\n[Context Start]\n${context}\n[Context End]\n\nQuestion: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ answer: text });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Failed to generate content. Please check server logs or API Key.' });
    }
}
