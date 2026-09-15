const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const dataFile = path.join(__dirname, "data.json");

// Read data from JSON file
function readData() {
  try {
    const data = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return {
      subjects: [],
      topics: []
    };
  }
}

// Write data to JSON file
function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Test route
app.get("/api", (req, res) => {
  res.json({
    message: "SmartStudy backend is running!"
  });
});

// Get all data
app.get("/api/data", (req, res) => {
  const data = readData();
  res.json(data);
});
// Replace all data
app.put("/api/data", (req, res) => {
  const data = {
    subjects: req.body.subjects || [],
    topics: req.body.topics || []
  };

  writeData(data);

  res.json(data);
});

// Clear all data
app.delete("/api/data", (req, res) => {
  const data = {
    subjects: [],
    topics: []
  };

  writeData(data);

  res.json(data);
});

// Get subjects
app.get("/api/subjects", (req, res) => {
  const data = readData();
  res.json(data.subjects);
});

// Add subject
app.post("/api/subjects", (req, res) => {
  const data = readData();

  const subject = {
    id: Date.now().toString(),
    ...req.body
  };

  data.subjects.push(subject);
  writeData(data);

  res.status(201).json(subject);
});

// Update subject
app.put("/api/subjects/:id", (req, res) => {
  const data = readData();

  const index = data.subjects.findIndex(
    (subject) => subject.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Subject not found"
    });
  }

  data.subjects[index] = {
    ...data.subjects[index],
    ...req.body
  };

  writeData(data);

  res.json(data.subjects[index]);
});

// Delete subject
app.delete("/api/subjects/:id", (req, res) => {
  const data = readData();

  const subjectExists = data.subjects.some(
    (subject) => subject.id === req.params.id
  );

  if (!subjectExists) {
    return res.status(404).json({
      message: "Subject not found"
    });
  }

  data.subjects = data.subjects.filter(
    (subject) => subject.id !== req.params.id
  );

  // Also delete topics belonging to this subject
  data.topics = data.topics.filter(
    (topic) => topic.subjectId !== req.params.id
  );

  writeData(data);

  res.json({
    message: "Subject deleted successfully"
  });
});

// Get topics
app.get("/api/topics", (req, res) => {
  const data = readData();
  res.json(data.topics);
});

// Add topic
app.post("/api/topics", (req, res) => {
  const data = readData();

  const topic = {
    id: Date.now().toString(),
    ...req.body
  };

  data.topics.push(topic);
  writeData(data);

  res.status(201).json(topic);
});

// Update topic
app.put("/api/topics/:id", (req, res) => {
  const data = readData();

  const index = data.topics.findIndex(
    (topic) => topic.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Topic not found"
    });
  }

  data.topics[index] = {
    ...data.topics[index],
    ...req.body
  };

  writeData(data);

  res.json(data.topics[index]);
});

// Delete topic
app.delete("/api/topics/:id", (req, res) => {
  const data = readData();

  const topicExists = data.topics.some(
    (topic) => topic.id === req.params.id
  );

  if (!topicExists) {
    return res.status(404).json({
      message: "Topic not found"
    });
  }

  data.topics = data.topics.filter(
    (topic) => topic.id !== req.params.id
  );

  writeData(data);

  res.json({
    message: "Topic deleted successfully"
  });
});

app.listen(PORT, () => {
  console.log(`SmartStudy backend running on http://localhost:${PORT}`);
});