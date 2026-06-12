import express from 'express';
import cors from 'cors';
import assetsRouter from './routes/assets';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/assets', assetsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT ?? 3002;
app.listen(PORT, () => {
  console.log(`Asset tracker API running on http://localhost:${PORT}`);
});

export default app;
