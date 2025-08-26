import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import getPort from "get-port";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('Backend is running!');
});

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in .env file');
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/generate-itinerary', async (req, res) => {
  const { destination, days, interests } = req.body;

  if (!destination || !days || !interests) {
    return res.status(400).json({ error: 'Please provide destination, days, and interests' });
  }

  const prompt = `
You are an AI travel planner. Generate a realistic ${days}-day itinerary for ${destination} with interests: ${interests}.
Follow these rules strictly:
- Output **valid JSON only**. Do NOT include any extra text, comments, or explanation.
- Format exactly as follows:
{
  "Day 1": [
    { "time": "9:00 AM", "activity": "Visit XYZ" },
    { "time": "11:00 AM", "activity": "Lunch at ABC" }
  ],
  "Day 2": [
    { "time": "9:30 AM", "activity": "Visit DEF" }
  ]
}
- Use **12-hour time format** (AM/PM) for all activities.
- Each day should have **4–6 activities**.
- Activity times must **increase chronologically**.
- Do not use vague prefixes like "Morning", "Afternoon", "Ride", etc. Only real times in HH:MM AM/PM format.
- Ensure all JSON keys and values are properly quoted.
- Keep the activities realistic and enjoyable, considering ${interests}.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const itinerary = JSON.parse(response.choices[0].message.content);
    res.json(itinerary);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});
app.post('/api/generate-suggestions', async (req, res) => {
  const { destination, interests } = req.body;

  if (!destination || !interests) {
    return res.status(400).json({ error: 'Please provide destination and interests' });
  }

  const prompt = `
You are an AI travel assistant. Suggest 8–12 extra activities for ${destination} considering interests: ${interests}.
Follow these rules strictly:
- Output **valid JSON only**.
- Format as a JSON array of strings:
[
  "Activity 1",
  "Activity 2",
  "Activity 3"
]
- Do NOT include times or assign them to specific days.
- Keep activities realistic, fun, and specific.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const suggestions = JSON.parse(response.choices[0].message.content);

    if (!Array.isArray(suggestions)) {
      throw new Error('Response was not an array');
    }

    res.json({suggestions});
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

app.get('/', (req, res) => {
  res.redirect('http://localhost:52502');
});

async function startServer() {
  //const port = await getPort({ port: 5000 });
  const port = 52502;
  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

startServer();
