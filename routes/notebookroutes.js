const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Notebook = require('../models/Notebook');

// Create a new notebook
router.post('/', auth, async (req, res) => {
  try {
    const notebook = new Notebook({
      ...req.body,
      owner: req.user._id
    });
    await notebook.save();
    res.status(201).json(notebook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all notebooks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notebooks = await Notebook.find({
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id },
        { isPublic: true }
      ]
    }).sort({ createdAt: -1 });
    res.json(notebooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific notebook
router.get('/:id', auth, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id },
        { isPublic: true }
      ]
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a notebook
router.patch('/:id', auth, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    Object.assign(notebook, req.body);
    await notebook.save();
    res.json(notebook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a notebook
router.delete('/:id', auth, async (req, res) => {
  try {
    const notebook = await Notebook.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    res.json({ message: 'Notebook deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a chapter to a notebook
router.post('/:id/chapters', auth, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const chapterCount = notebook.chapters.length;
    notebook.chapters.push({
      ...req.body,
      order: chapterCount + 1
    });
    
    await notebook.save();
    res.status(201).json(notebook.chapters[notebook.chapters.length - 1]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a chapter
router.patch('/:id/chapters/:chapterId', auth, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const chapter = notebook.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    
    Object.assign(chapter, req.body);
    await notebook.save();
    res.json(chapter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a chapter
router.delete('/:id/chapters/:chapterId', auth, async (req, res) => {
  try {
    const notebook = await Notebook.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    notebook.chapters.pull(req.params.chapterId);
    await notebook.save();
    res.json({ message: 'Chapter deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Share a notebook with another user
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const notebook = await Notebook.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    if (notebook.sharedWith.includes(userId)) {
      return res.status(400).json({ error: 'Notebook already shared with this user' });
    }
    
    notebook.sharedWith.push(userId);
    await notebook.save();
    res.json(notebook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
