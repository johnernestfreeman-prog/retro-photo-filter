import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import 'dotenv/config';
import { logFilterHistory, getFilterHistory } from './db';
import { applyRetroGrading, DEFAULT_GRADING_OPTIONS, GradingOptions } from './retroGrading';

const app = express();
app.use(cors());

const OUTPUT_DIR = path.join(__dirname, '..', 'outputs');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
app.use('/outputs', express.static(OUTPUT_DIR));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/filter', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided under field "image".' });
  }

  const options: GradingOptions = {
    brightness: req.body.brightness ? parseFloat(req.body.brightness) : DEFAULT_GRADING_OPTIONS.brightness,
    desaturation: req.body.desaturation
      ? parseFloat(req.body.desaturation)
      : DEFAULT_GRADING_OPTIONS.desaturation,
  };

  try {
    const image = sharp(req.file.buffer).ensureAlpha();
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
      const graded = applyRetroGrading({ r: data[i], g: data[i + 1], b: data[i + 2] }, options);
      data[i] = graded.r;
      data[i + 1] = graded.g;
      data[i + 2] = graded.b;
    }

    const outputBuffer = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toBuffer();

    const resultFilename = `${Date.now()}-${crypto.randomUUID()}.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, resultFilename), outputBuffer);

    res.set('Content-Type', 'image/png');
    res.send(outputBuffer);

    logFilterHistory({
      originalFilename: req.file.originalname,
      fileSizeBytes: req.file.size,
      brightness: options.brightness,
      desaturation: options.desaturation,
      resultFilename,
    }).catch((err) => console.error('Failed to log filter history:', err));
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image.' });
  }
});

app.get('/history', async (_req, res) => {
  try {
    const history = await getFilterHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Retro photo filter backend running on port ${PORT}`);
});