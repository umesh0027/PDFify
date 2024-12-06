const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pdfRoutes = require('./routes/Pdfroutes');
const mergePdfRoutes = require('./routes/MergePdfroutes');
const path = require('path');
const dotenv = require("dotenv");
const app = express();


dotenv.config();

// Middlewares
app.use(cors({
  origin: "*", // Allow the frontend to make requests

}));
app.use(bodyParser.json());
// app.use('/uploads/temp', express.static(path.join(__dirname, 'temp')));
// app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/pdf', mergePdfRoutes);

app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});


// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} PORT`);
});
