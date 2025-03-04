import express from "express";
import dotenv from "dotenv";
import path from "path";

import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Increase payload size limit - add this BEFORE other middleware
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch(e) {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid JSON payload' 
            });
            throw Error('Invalid JSON');
        }
    }
}));

app.use(express.urlencoded({ 
    limit: '50mb', 
    extended: true,
    parameterLimit: 100000
}));

// Define dirname to point to current directory
const __dirname = process.cwd();

app.use(express.json());

// CORS middleware - place this BEFORE your routes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // For testing only
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    // Important: Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
    // Updated paths to stay in backend directory
    app.use(express.static(path.join(__dirname, "build/server")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "build", "server", "index.js"));
    });
}

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});