import { handler } from './build/handler.js';
import express from 'express';

const app = express();

// Increase header size limit
app.use((req, res, next) => {
    // Node.js default is 8KB, increase to 16KB
    req.maxHeaderSize = 16384;
    next();
});

// Let SvelteKit handle everything else
app.use(handler);

app.listen(5190, () => {
    console.log('Server running on http://localhost:5190');
});