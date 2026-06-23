import { Router } from 'express';
import { generateImage, removeFurniture, restyleRoom, enhanceImage } from '../controllers/generate.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Virtual Staging (empty room -> furnished)
router.post('/generate', upload.single('image'), generateImage);

// Furniture Removal (furnished -> empty)
router.post('/remove-furniture', upload.single('image'), removeFurniture);

// Style Change (furnished -> different style)
router.post('/restyle', upload.single('image'), restyleRoom);

// Image Enhancement (HDR, lighting, twilight)
router.post('/enhance', upload.single('image'), enhanceImage);

export default router;
