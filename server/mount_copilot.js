import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverFile = path.join(__dirname, 'server.js');

let code = fs.readFileSync(serverFile, 'utf8');

if (!code.includes('copilotRouter')) {
  code = code.replace(
    "import syncRouter from './routes/sync.js';",
    "import syncRouter from './routes/sync.js';\nimport copilotRouter from './routes/copilot.js';"
  );
  code = code.replace(
    "app.use('/api/sync', syncRouter);",
    "app.use('/api/sync', syncRouter);\napp.use('/api/copilot', copilotRouter);"
  );
  fs.writeFileSync(serverFile, code, 'utf8');
  console.log('Mounted copilotRouter in server.js');
} else {
  console.log('copilotRouter already present in server.js');
}
