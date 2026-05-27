import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.resolve(__dirname, '../src/data/fitwill-exercises.json');
const targetPath = path.resolve(__dirname, '../dist/data/fitwill-exercises.json');

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.copyFileSync(sourcePath, targetPath);

console.log(`Copied Fitwill catalog to ${targetPath}`);
