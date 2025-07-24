const express = require('express');
const router = express.Router();
const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');

// ✅ OpenAI Initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Preloaded questions from parsed PDFs (Easy, Medium, Hard)
const awsQuestions = {
  easy: require('../data/aws_easy.json'),
  medium: require('../data/aws_medium.json'),
  hard: require('../data/aws_hard.json')
};

const devopsQuestions = {
  easy: require('../data/devops_easy.json'),
  medium: require('../data/devops_medium.json'),
  hard: require('../data/devops_hard.json')
};

// ✅ GET question based on category and level
router.get('/question/:category/:level', (req, res) => {
  const { category, level } = req.params;
  const validLevels = ['easy', 'medium', 'hard'];

  if (!['aws', 'devops'].includes(category) || !validLevels.includes(level)) {
    return res.status(400).json({ error: "Invalid category or level" });
  }

  const questionSet = category === 'aws' ? awsQuestions[level] : devopsQuestions[level];
  const randomIndex = Math.floor(Math.random() * questionSet.length);
  const randomQuestion = questionSet[randomIndex];

  res.json({ question: randomQuestion });
});

// ✅ POST: AI Feedback Generation
router.post('/', async (req, res) => {
  const { question, answer } = req.body;

  try {
    const prompt = `
You are an AI interview coach.

Evaluate the candidate’s answer to the following question and provide detailed guidance in 4 structured sections:

1️⃣ **EXPERIENCED (10+ years):**
- Ideal answer guidance
- Reasoning

2️⃣ **FRESHER (0–1 years):**
- Ideal answer guidance
- Reasoning

3️⃣ **GENERAL SUGGESTIONS:**
- Feedback and improvement tips

4️⃣ **HOW TO ANSWER:**
- One sample answer for experienced (15+ years)
- One sample answer for fresher

---
🧾 Question: ${question}
🗣️ Answer: ${answer}

Respond in the format:
**EXPERIENCED:**
[...]



**FRESHER:**
[...]



**SUGGESTIONS:**
[...]

**HOW TO ANSWER:**
Experienced Sample:
[...]

Fresher Sample:
[...]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const feedback = response.choices[0].message.content;
    res.json({ feedback });
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    res.status(500).json({ error: "Failed to get AI feedback" });
  }
});

module.exports = router;
