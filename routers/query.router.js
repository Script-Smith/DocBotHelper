import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import NodeCache from "node-cache";

dotenv.config();

const configuration = new GoogleGenerativeAI(process.env.API_KEY);
const modelId = "gemini-pro";
const model = configuration.getGenerativeModel({ model: modelId });

const queryRouter = express.Router();

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

queryRouter.post("/ask", async (req, res) => {
  try {
    const data = fs.readFileSync("data.json", "utf-8");
    if (!data || data.trim().length === 0) {
      return res.status(400).json({ message: "Document not found!" });
    }

    const parsedData = JSON.parse(data);
    const { question } = req.body;
    
    // Check cache for existing response
    const cacheKey = `response_${question}`;
    if (cache.has(cacheKey)) {
      return res.send({ answer: cache.get(cacheKey) });
    }

    const context = JSON.stringify(parsedData);
    const prompt = `Based on the following data: ${context}. Answer the following question: ${question} and add some text to make the answer more realistic`;

    // Call the Google Generative AI model
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Cache the response
    cache.set(cacheKey, text);

    res.send({ answer: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default queryRouter;
