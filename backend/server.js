import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import getPort from "get-port";

dotenv.config(); // Load API key from .env

const app = express();
app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('Backend is running!');
});

// OpenAI API setup
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
You are an AI travel planner. Generate a ${days}-day itinerary for ${destination} with interests: ${interests}.
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

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: prompt }],
});


  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    // Parse GPT response as JSON
    const itinerary = JSON.parse(response.choices[0].message.content);
    res.json(itinerary);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});


app.get('/', (req, res) => {
  res.redirect('http://localhost:65535'); // Adjust the URL as needed
});



// Your middleware & routes here
// e.g., app.use(express.json());

async function startServer() {
  // Try 5000 first, otherwise pick any free port
  const port = await getPort({ port: 5000 });

  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

startServer();
