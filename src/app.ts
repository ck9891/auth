import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use(authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});