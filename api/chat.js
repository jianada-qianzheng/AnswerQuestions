import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    try {
        const githubRawUrl = process.env.GITHUB_RAW_URL;
        const githubToken = process.env.GITHUB_TOKEN; 

        const fetchOptions = githubToken ? { headers: { Authorization: `token ${githubToken}` } } : {};
        const fileResponse = await fetch(githubRawUrl, fetchOptions);

        if (!fileResponse.ok) {
            throw new Error(`GitHub fetch failed: ${fileResponse.statusText}`);
        }

        const context = await fileResponse.text();

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a precise reading comprehension assistant. Answer the question based strictly on the provided context. If the answer is not in the context, explicitly state that you cannot find the answer in the provided text.\n\n[Context Start]\n${context}\n[Context End]\n\nQuestion: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ answer: text });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Failed to process request. Check server logs, API Key, or GitHub configuration.' });
    }
}
