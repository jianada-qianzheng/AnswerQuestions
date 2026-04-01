import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Please use the web interface.' });
    }

    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is missing.' });
    }

    try {
        const key = process.env.GEMINI_API_KEY;
        const url = process.env.GITHUB_RAW_URL;

        if (!key) {
            return res.status(500).json({ error: 'System Error: GEMINI_API_KEY is missing in Vercel Environment Variables.' });
        }
        if (!url) {
            return res.status(500).json({ error: 'System Error: GITHUB_RAW_URL is missing in Vercel Environment Variables.' });
        }

        const fileResponse = await fetch(url);

        if (!fileResponse.ok) {
            return res.status(500).json({ error: `GitHub Fetch Error: Code ${fileResponse.status}. Please check if GITHUB_RAW_URL is a valid raw text link.` });
        }

        const context = await fileResponse.text();

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Context: ${context}\n\nQuestion: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ answer: text });

    } catch (err) {
        console.error("Execution Error:", err);
        res.status(500).json({ error: `API Error: ${err.message}` });
    }
}
