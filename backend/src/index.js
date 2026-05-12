require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3001', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/daily-task', require('./routes/dailyTask'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/facebook-groups', require('./routes/facebookGroups'));
app.use('/api/facebook-ids', require('./routes/facebookIds'));
app.use('/api/whatsapp-groups', require('./routes/whatsappGroups'));
app.use('/api/instructions', require('./routes/instructions'));
app.use('/api/tutorials', require('./routes/tutorials'));
app.use('/api/chat', require('./routes/chat'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
