import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { saveUpload } from '../utils/storage';

const uploadRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadRouter.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }

  try {
    const result = await saveUpload(req.file);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar upload.' });
  }
});

export default uploadRouter;
