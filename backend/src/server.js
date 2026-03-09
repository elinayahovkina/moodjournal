const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');
const { getJournalingResponse } = require('./geminiClient');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/entries', async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany();
    return res.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.post('/entries', async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood) {
      return res.status(400).json({ error: 'Missing mood' });
    }
    const response = await getJournalingResponse(mood);
    const entry = await prisma.journalEntry.create({
      data: {
        mood: mood,
        aiResponse: response,
      },
    });
    return res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating entry:', error);
    return res
      .status(500)
      .json({ error: 'Failed to save entry or get AI response' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
