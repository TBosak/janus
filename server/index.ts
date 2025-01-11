import express from 'express';
import { resolve, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { readdir } from 'fs/promises';
import { access } from 'fs/promises';
import { unlink } from 'fs/promises';

const app = express();

// Define the root folder for static files
const browserFolder = resolve(__dirname, '../dist/app/browser');
const uploadFolder = resolve('./uploads');
const timelinesFolder = resolve('./timelines');

// Ensure upload folder exists
if (!existsSync(uploadFolder)) {
  mkdirSync(uploadFolder);
}

// Ensure timelines folder exists
if (!existsSync(timelinesFolder)) {
  mkdirSync(timelinesFolder);
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());

app.post('/api/timelines', async (req, res) => {
  try {
    const timelineData = req.body;

    // Validate timeline data
    if (
      !timelineData ||
      typeof timelineData !== 'object' ||
      !timelineData.events
    ) {
      return res.status(400).json({ error: 'Invalid timeline data' });
    }

    // Generate a unique ID for the timeline
    const id = randomUUID();
    const timelinePath = join(timelinesFolder, `${id}.json`);

    // Save the timeline
    const jsonData = JSON.stringify({ id, ...timelineData }, null, 2);
    await Bun.write(timelinePath, jsonData);

    return res
      .status(201)
      .json({ message: 'Timeline created successfully', id });
  } catch (error) {
    console.error('Error creating timeline:', error);
    return res.status(500).json({ error: 'Failed to create timeline' });
  }
});

// Get a specific timeline by ID
app.get('/api/timelines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const timelinePath = join(timelinesFolder, `${id}.json`);

    if (!existsSync(timelinePath)) {
      return res.status(404).json({ error: 'Timeline not found' });
    }

    const timelineData = await Bun.file(timelinePath).text();
    return res.status(200).json(JSON.parse(timelineData));
  } catch (error) {
    console.error('Error retrieving timeline:', error);
    return res.status(500).json({ error: 'Failed to retrieve timeline' });
  }
});

// List all timelines
app.get('/api/timelines', async (req, res) => {
  try {
    const files = await readdir(timelinesFolder);
    const timelines = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const timelineData = await Bun.file(join(timelinesFolder, file)).text();
        timelines.push(JSON.parse(timelineData));
      }
    }

    res.status(200).json(timelines);
  } catch (error) {
    console.error('Error listing timelines:', error);
    res.status(500).json({ error: 'Failed to list timelines' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file; // Retrieve the file from Multer
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate a unique file name
    const fileName = `${randomUUID()}-${file.originalname}`;
    const filePath = join(uploadFolder, fileName);

    // Save the file using Bun.writeFile
    await Bun.write(filePath, file.buffer);

    // Dynamically construct the file URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    const fileUrl = `${baseUrl}/uploads/${fileName}`;

    // Return the public file URL
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Update timeline by ID
app.put('/api/timelines/:id', async (req, res) => {
  const { id } = req.params;
  const timelinePath = join(timelinesFolder, `${id}.json`);
  const updatedTimeline = req.body;

  try {
    // Check if the timeline exists
    if (!existsSync(timelinePath)) {
      return res.status(404).json({ error: 'Timeline not found' });
    }

    // Validate and save the updated timeline
    const jsonData = JSON.stringify(updatedTimeline, null, 2);
    await Bun.write(timelinePath, jsonData);

    return res.status(200).json({ message: 'Timeline updated successfully' });
  } catch (error) {
    console.error('Error updating timeline:', error);
    return res.status(500).json({ error: 'Failed to update timeline' });
  }
});

app.delete('/api/timelines/:id', async (req, res) => {
  const timelineId = req.params.id;
  const filePath = join(timelinesFolder, `${timelineId}.json`);

  try {
    // Check if the file exists
    await access(filePath);
    // Delete the file
    await unlink(filePath);

    res.status(200).send({ message: 'Timeline deleted successfully' });
  } catch (err) {
    console.error('Error deleting timeline:', err);
    res.status(404).send({ message: 'Timeline not found' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadFolder));

// Serve static files
app.use(express.static(browserFolder));

// Fallback to index.html for SPA routes
app.use((req, res) => {
  // Prevent directory traversal
  if (req.path.includes('..')) {
    return res.status(403).send('Forbidden');
  }

  // Resolve the requested file path
  const filePath = join(browserFolder, req.path);

  // Serve static files if they exist
  if (existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // Fallback to index.html for Angular SPA
  const indexPath = join(browserFolder, 'index.html');
  if (existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // If no file exists, return 404
  console.log('File not found, returning 404 for path:', req.path);
  return res.status(404).send('Not Found');
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
