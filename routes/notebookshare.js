const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Notebook, Chapter, Question, UserResponseChapter } = require('../models/Notebook');
const ensureAuthenticated = require('../middlewares/auth');
const axios = require('axios');
const mongoose = require('mongoose');
const ShortenedUrl = require('../models/ShortenedUrl'); // Import the ShortenedUrl model
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Add this line to import the crypto module


const upload = multer({ dest: 'uploads/' }).fields([
  { name: 'pdfs', maxCount: 10 },
  { name: 'videos', maxCount: 10 }, 
  { name: 'audios', maxCount: 10 }
]);




// // Generate a share link for a notebook
// router.post('/notebooks/:id/share', ensureAuthenticated, async (req, res) => {
//   try {
//     const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';
//     const notebook = await Notebook.findById(req.params.id);

//     if (!notebook) {
//       return res.status(404).json({ message: 'Notebook not found' });
//     }

//     // Get the user's permission level for this notebook
//     const userPermission = notebook.permissions.find(p => p.userId.toString() === req.user.id.toString());

//     // Ensure the user has the correct permission to share
//     if (!userPermission || (userPermission.level === 'view-only' && req.body.accessType !== 'view-only')) {
//       return res.status(403).json({ message: 'Unauthorized to share with this access level' });
//     }

//     const payload = { notebookId: notebook._id, accessType: req.body.accessType };
//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

//     let shortenedUrl = await ShortenedUrl.findOne({ originalUrl: token, accessType: req.body.accessType });

//     if (!shortenedUrl) {
//       const shortToken = crypto.randomBytes(4).toString('hex');
//       shortenedUrl = new ShortenedUrl({
//         token: shortToken,
//         originalUrl: token,
//         accessType: req.body.accessType
//       });
//       await shortenedUrl.save();
//     }

//     const shareLink = `http://localhost:3000/shared/${shortenedUrl.token}`;
//     res.status(200).json({ shareLink });

//   } catch (error) {
//     console.error('Error generating shareable link:', error);
//     res.status(500).json({ message: 'Failed to generate shareable link', error: error.toString() });
//   }
// });

// // Generate a share link for a chapter
// router.post('/chapters/:id/share', ensureAuthenticated, async (req, res) => {
//   try {
//     const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';
//     const chapter = await Chapter.findById(req.params.id).populate('notebook');

//     if (!chapter) {
//       return res.status(404).json({ message: 'Chapter not found' });
//     }

//     const notebook = chapter.notebook;

//     // Get the user's permission level for this notebook
//     const userPermission = notebook.permissions.find(p => p.userId.toString() === req.user.id.toString());

//     // Ensure the user has the correct permission to share
//     if (!userPermission || (userPermission.level === 'view-only' && req.body.accessType !== 'view-only')) {
//       return res.status(403).json({ message: 'Unauthorized to share with this access level' });
//     }

//     const payload = { chapterId: chapter._id, accessType: req.body.accessType };
//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

//     let shortenedUrl = await ShortenedUrl.findOne({ originalUrl: token, accessType: req.body.accessType });

//     if (!shortenedUrl) {
//       const shortToken = crypto.randomBytes(4).toString('hex');
//       shortenedUrl = new ShortenedUrl({
//         token: shortToken,
//         originalUrl: token,
//         accessType: req.body.accessType,
//       });
//       await shortenedUrl.save();
//     }

//     const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shortenedUrl.token}`;
//     res.status(200).json({ shareLink });

//     // Optionally, add the user to the notebook's permissions if they aren't already there
//     const userId = req.user.id;
//     const notebookEnrolled = notebook.permissions.some(p => p.userId.toString() === userId.toString());

//     if (!notebookEnrolled) {
//       notebook.permissions.push({ userId, level: req.body.accessType });
//       await notebook.save();
//     }

//   } catch (error) {
//     console.error('Error generating shareable link:', error);
//     res.status(500).json({ message: 'Failed to generate shareable link', error: error.toString() });
//   }
// });


// Generate a share link for a notebook
router.post('/notebooks/:id/share', ensureAuthenticated, async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) {
      return res.status(404).json({ message: 'Notebook not found' });
    }

    // Get the user's permission level for this notebook
    const userPermission = notebook.permissions.find(p => p.userId.toString() === req.user.id.toString());
    console.log("User permission", userPermission,  req.user.id); 
    // Ensure the user has permission to share
    if (!userPermission) {
      return res.status(403).json({ message: 'Unauthorized to share' });
    }

    // If user is view-only, they should only be able to share with view-only access
    if (userPermission.level === 'view-only' && req.body.accessType !== 'view-only') {
      return res.status(403).json({ message: 'View-only users can only share with view-only access' });
    }

    const payload = { notebookId: notebook._id, accessType: req.body.accessType };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    let shortenedUrl = await ShortenedUrl.findOne({ originalUrl: token, accessType: req.body.accessType });

    if (!shortenedUrl) {
      const shortToken = crypto.randomBytes(4).toString('hex');
      shortenedUrl = new ShortenedUrl({
        token: shortToken,
        originalUrl: token,
        accessType: req.body.accessType
      });
      await shortenedUrl.save();
    }

    const shareLink = `http://localhost:3000/shared/${shortenedUrl.token}`;
    res.status(200).json({ shareLink });

  } catch (error) {
    console.error('Error generating shareable link:', error);
    res.status(500).json({ message: 'Failed to generate shareable link', error: error.toString() });
  }
});


// Generate a share link for a chapter
router.post('/chapters/:id/share', ensureAuthenticated, async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';
    const chapter = await Chapter.findById(req.params.id).populate('notebook');

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const notebook = chapter.notebook;

    // Get the user's permission level for this notebook
    const userPermission = notebook.permissions.find(p => p.userId.toString() === req.user.id.toString());

    // Ensure the user has permission to share
    if (!userPermission) {
      return res.status(403).json({ message: 'Unauthorized to share' });
    }

    // If user is view-only, they should only be able to share with view-only access
    if (userPermission.level === 'view-only' && req.body.accessType !== 'view-only') {
      return res.status(403).json({ message: 'View-only users can only share with view-only access' });
    }

    const payload = { chapterId: chapter._id, accessType: req.body.accessType };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    let shortenedUrl = await ShortenedUrl.findOne({ originalUrl: token, accessType: req.body.accessType });

    if (!shortenedUrl) {
      const shortToken = crypto.randomBytes(4).toString('hex');
      shortenedUrl = new ShortenedUrl({
        token: shortToken,
        originalUrl: token,
        accessType: req.body.accessType,
      });
      await shortenedUrl.save();
    }

    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shortenedUrl.token}`;
    res.status(200).json({ shareLink });

  } catch (error) {
    console.error('Error generating shareable link:', error);
    res.status(500).json({ message: 'Failed to generate shareable link', error: error.toString() });
  }
});




// Handle shared links (for both notebooks and chapters)
router.get('/shared/:shortToken', ensureAuthenticated, async (req, res) => {
  try {
    const shortenedUrl = await ShortenedUrl.findOne({ token: req.params.shortToken });

    if (!shortenedUrl) {
      return res.status(404).json({ message: 'Invalid or expired link' });
    }

    const decoded = jwt.verify(shortenedUrl.originalUrl, process.env.JWT_SECRET || 'your_default_secret_key');

    let sharedItem;
    let itemType;

    if (decoded.notebookId) {
      sharedItem = await Notebook.findById(decoded.notebookId).populate('chapters');
      itemType = 'notebook';

      // Filter chapters based on the user's permissions
      if (req.user.id !== sharedItem.user.toString()) {
        const userPermission = sharedItem.permissions.find(p => p.userId.toString() === req.user.id.toString());
        if (userPermission?.level === 'view-only') {
          sharedItem.chapters = sharedItem.chapters.filter(chapter =>
            chapter.permissions.some(p => p.userId.toString() === req.user.id.toString())
          );
        }
      }
    } else if (decoded.chapterId) {
      sharedItem = await Chapter.findById(decoded.chapterId).populate('notebook');
      itemType = 'chapter';
    }

    if (!sharedItem) {
      return res.status(404).json({ message: 'Shared item not found' });
    }

    res.status(200).json({
      title: sharedItem.title,
      notebookId: itemType === 'notebook' ? sharedItem._id : sharedItem.notebook._id,
      chapterId: itemType === 'chapter' ? sharedItem._id : null,
      accessType: shortenedUrl.accessType,
      itemType: itemType
    });
  } catch (error) {
    console.error('Error fetching shared data:', error);
    res.status(500).json({ message: 'Failed to fetch shared data', error: error.toString() });
  }
});


// Enroll in a chapter and also add the user to the notebook permissions
router.post('/chapters/:id/enroll', ensureAuthenticated, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('notebook');
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const userId = req.user.id;
    const { accessType } = req.body;

    // Check if the user is already enrolled in the chapter
    const alreadyEnrolled = chapter.permissions.some(p => p.userId.toString() === userId.toString());

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'User already enrolled in this chapter' });
    }

    // If not already enrolled, push the new permission
    chapter.permissions.push({ userId, level: accessType });
    await chapter.save();

    // Also add permission to the notebook if not already present
    const notebook = chapter.notebook;
    const notebookEnrolled = notebook.permissions.some(p => p.userId.toString() === userId.toString());

    if (!notebookEnrolled) {
      notebook.permissions.push({ userId, level: accessType });
      await notebook.save();
    }

    res.status(200).json({ message: 'User enrolled successfully in chapter and notebook' });
  } catch (error) {
    console.error('Error enrolling user in chapter:', error);
    res.status(500).json({ message: 'Failed to enroll user in chapter', error: error.toString() });
  }
});




// Get a specific chapter by ID
router.get('/chapters/:id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const chapter = await Chapter.findOne({
      _id: req.params.id,
      $or: [
        { 'notebook.user': userId },
        { 'permissions.userId': userId },
        { 'notebook.permissions.userId': userId }
      ]
    }).populate('notebook');

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found or access denied' });
    }

    res.status(200).json(chapter);
  } catch (error) {
    console.error('Error retrieving specific chapter:', error);
    res.status(500).json({ message: 'Failed to retrieve chapter', error: error.toString() });
  }
});




// Enroll in a notebook or chapter
router.post('/notebooks/:id/enroll', ensureAuthenticated, async (req, res) => {
  try {
    const notebook = await Notebook.findById(req.params.id);
    if (!notebook) {
      return res.status(404).json({ message: 'Notebook not found' });
    }

    const userId = req.user.id;
    const { accessType } = req.body;

    // Check if the user is already enrolled based on userId and accessType
    const alreadyEnrolled = notebook.permissions.some(p => p.userId.toString() === userId.toString());

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'User already enrolled' });
    }

    // If not already enrolled, push the new permission
    notebook.permissions.push({ userId, level: accessType });
    await notebook.save();

    res.status(200).json({ message: 'User enrolled successfully' });
  } catch (error) {
    console.error('Error enrolling user:', error);
    res.status(500).json({ message: 'Failed to enroll user', error: error.toString() });
  }
});





module.exports = router;
