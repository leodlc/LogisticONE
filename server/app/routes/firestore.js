const express = require('express');
const router = express.Router();
const { addDocument, getDocuments } = require('../controllers/firestore');

router.post('/add', addDocument);
router.get('/get/:collection', getDocuments);

module.exports = router;
