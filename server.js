const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3005;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Static files serving
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// API: Get video list
app.get('/api/videos', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }
        // Filter video files
        const videos = files.filter(file => ['.mp4', '.webm'].includes(path.extname(file).toLowerCase()));
        res.json(videos.map(file => ({
            name: file,
            url: `/uploads/${file}`
        })));
    });
});

// API: Upload video
app.post('/api/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Video Site listening at http://43.138.163.183:${port}`);
});
