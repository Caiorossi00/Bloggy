const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/simpleblog", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", PostSchema);

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

app.post("/posts", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const post = new Post({ title, content });

  try {
    await post.save();
    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).send(posts);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).send("Postagem não encontrada");
    }
    res.status(200).send(post);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
    if (!post) {
      return res.status(404).send("Postagem não encontrada");
    }
    res.status(200).send(post);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).send("Postagem não encontrada");
    }
    res.status(200).send("Postagem excluída");
  } catch (err) {
    res.status(400).send(err);
  }
});
