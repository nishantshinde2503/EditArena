

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const multer = require('multer');
const path = require('path');

let edits = []; // 🧠 Global edit storage
let challenges = [];

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save in 'uploads' folder
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// Endpoint to handle challenge form submission
app.post('/api/challenges', upload.array('files', 5), (req, res) => {
  const { title, description, deadline } = req.body;
  const uploadedFiles = req.files;

  const newChallenge = {
    id: Date.now(),
    title,
    description,
    deadline,
    files: uploadedFiles.map(file => file.filename)
  };

  challenges.push(newChallenge); // 🧠 Add to memory

  console.log('📥 New Challenge Submission:', newChallenge);
  res.json({ success: true, message: 'Challenge received!' });
});


// --- POST an edit submission ---
app.post('/api/edits', express.json(), (req, res) => {
  const { challengeId, editor, videoUrl, caption } = req.body;

  if (!challengeId || !editor || !videoUrl) {
    return res.status(400).json({ message: 'Challenge ID, editor name and video URL are required.' });
  }

  const edit = {
    id: Date.now(),
    challengeId: parseInt(challengeId),
    editor,
    videoUrl,
    caption,
    likes: 0,
    dislikes: 0,
  };

  edits.push(edit);

  console.log('🎞️ New edit submitted:', edit);
  res.status(201).json({ message: 'Edit submitted successfully!', edit });
});

app.get('/api/edits', (req, res) => {
  res.json(edits);
});



app.get('/api/edits/:challengeId', (req, res) => {
  const challengeId = parseInt(req.params.challengeId);
  const filtered = edits.filter(edit => edit.challengeId === challengeId);
  res.json(filtered);
});



app.get('/', (req, res) => {
  res.send('🎬 EditArena Backend is LIVE!');
});




// ✅ Add this new route
app.get('/api/challenges', (req, res) => {
  res.json(challenges);
});

app.post('/api/edits/:id/vote', (req, res) => {
  const editId = parseInt(req.params.id);
  const { voteType } = req.body;

  const edit = edits.find(e => e.id === editId);
  if (!edit) {
    return res.status(404).json({ message: 'Edit not found' });
  }

  if (voteType === 'like') {
    edit.likes += 1;
  } else if (voteType === 'dislike') {
    edit.dislikes += 1;
  } else {
    return res.status(400).json({ message: 'Invalid vote type' });
  }

  res.json({ message: 'Vote recorded!', edit });
});


const PORT = process.env.PORT ||5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const path = require('path');

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route to serve React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
