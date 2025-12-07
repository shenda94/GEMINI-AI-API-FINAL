import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer();
const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', upload.single("image"), async (req, res) => {
    try {
        let conversation;

        // Jika yang dikirim adalah FormData (ada file)
        if (req.file) {
            conversation = JSON.parse(req.body.conversation);

            if (!Array.isArray(conversation)) {
                throw new Error("Messages must be an array!");
            }

            // Convert image to base64
            const base64Image = req.file.buffer.toString("base64");

            const contents = conversation.map(({ role, text }) => ({
                role,
                parts: [{ text }]
            }));

            // Tambahkan gambar sebagai part baru
            contents.push({
                role: "user",
                parts: [{
                    inlineData: {
                        mimeType: req.file.mimetype,
                        data: base64Image
                    }
                }]
            });

            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents
            });

            return res.status(200).json({ result: response.text });
        }

        // Jika request berupa JSON biasa (chat text)
        conversation = req.body.conversation;

        if (!Array.isArray(conversation)) {
            throw new Error("Messages must be an array!");
        }

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents
        });

        res.status(200).json({ result: response.text });

    } catch (e) {
        console.error("Chat error:", e);
        res.status(500).json({ error: e.message });
    }
});