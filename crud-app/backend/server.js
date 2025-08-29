const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

let items = []; // in-memory store

// READ all
app.get("/items", (req, res) => {
  res.json(items);
});

// CREATE
app.post("/items", (req, res) => {
  const item = { id: items.length + 1, name: req.body.name };
  items.push(item);
  res.status(201).json(item);
});

// UPDATE
app.put("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find((i) => i.id === id);
  if (!item) return res.status(404).json({ error: "Not found" });
  item.name = req.body.name;
  res.json(item);
});

// DELETE
app.delete("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  items = items.filter((i) => i.id !== id);
  res.json({ message: "Deleted" });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

