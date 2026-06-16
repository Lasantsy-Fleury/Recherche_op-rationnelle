import 'reflect-metadata';
import express from 'express';
import path from 'path';
import { DataSource } from 'typeorm';
import { createServer as createViteServer } from 'vite';
import { MatrixHistory } from './src/server/entity/MatrixHistory';
import { solveHungarian } from './src/utils/solver';

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Database (TypeORM with SQLite for ease of persistent development inside sandbox)
const AppDataSource = new DataSource({
  type: 'better-sqlite3' as any,
  database: './database.sqlite',
  synchronize: true,
  logging: false,
  entities: [MatrixHistory],
});

let dbReady = false;
AppDataSource.initialize()
  .then(() => {
    console.log('Database initialized successfully with TypeORM.');
    dbReady = true;
  })
  .catch((err) => {
    console.error('Error during Database initialization:', err);
  });

// --- REST API Endpoints ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', dbReady });
});

// Run Hungarian Solver Server-side (Returns steps and solution)
app.post('/api/solve', (req, res) => {
  const { grid, mode, customLabels, customComplement } = req.body;
  if (!grid || !Array.isArray(grid)) {
    return res.status(400).json({ error: 'Grid must be a 2D array of numbers.' });
  }

  try {
    const steps = solveHungarian(grid, mode || 'min', customLabels, customComplement);
    res.json({ steps });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during solver calculation.' });
  }
});

// History: Get all saved matrices
app.get('/api/matrices', async (req, res) => {
  if (!dbReady) {
    return res.json([]); // Return empty list rather than crashing if DB is initializing
  }
  try {
    const repository = AppDataSource.getRepository(MatrixHistory);
    const matrices = await repository.find({ order: { createdAt: 'DESC' } });
    res.json(matrices);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch saved matrices.' });
  }
});

// History: Save a matrix
app.post('/api/matrices', async (req, res) => {
  if (!dbReady) {
    return res.status(503).json({ error: 'Database is not ready yet.' });
  }
  const { name, mode, rows, cols, grid } = req.body;
  if (!name || !grid || !rows || !cols) {
    return res.status(400).json({ error: 'Missing required matrix information.' });
  }

  try {
    const repository = AppDataSource.getRepository(MatrixHistory);
    const matrix = new MatrixHistory();
    matrix.name = name;
    matrix.mode = mode || 'min';
    matrix.rows = rows;
    matrix.cols = cols;
    matrix.grid = grid;

    await repository.save(matrix);
    res.status(201).json(matrix);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save matrix configuration.' });
  }
});

// History: Delete a saved matrix
app.delete('/api/matrices/:id', async (req, res) => {
  if (!dbReady) {
    return res.status(503).json({ error: 'Database is not ready.' });
  }
  const id = parseInt(req.params.id);
  try {
    const repository = AppDataSource.getRepository(MatrixHistory);
    await repository.delete(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete saved matrix.' });
  }
});

// --- Vite Dev & Build Mounting Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
