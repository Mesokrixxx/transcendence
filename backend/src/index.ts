import app from './app.ts';

const port = 8080;

app.listen(port, '0.0.0.0', () => {
	console.log(`Backend is listening on port ${port}`);
});
