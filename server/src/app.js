const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// CORS Configuration
const vercelRegex = /https:\/\/compound-management-system-[\w-]+-omar-mostafa-s-projects\.vercel\.app/;
const anyVercelRegex = /https:\/\/[\w-]+\.vercel\.app/;
const railwayRegex = /https:\/\/[\w-]+\.up\.railway\.app/;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ];

    if (
      allowedOrigins.includes(origin) ||
      vercelRegex.test(origin) ||
      anyVercelRegex.test(origin) ||
      railwayRegex.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// Global Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

// Cache-Control for API responses (improves performance)
app.use("/api", (req, res, next) => {
  if (req.method === "GET") {
    // Cache GET responses for 5 minutes in production
    res.set("Cache-Control", process.env.NODE_ENV === "production" 
      ? "public, max-age=300, stale-while-revalidate=600" 
      : "no-store");
  }
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
  skip: () => process.env.NODE_ENV !== "production", // Skip rate limiting in development mode
});
app.use("/api", limiter);

// Routes
const authRoutes = require("./modules/auth/auth.routes");
const buildingsRoutes = require("./modules/buildings/buildings.routes");
const apartmentsRoutes = require("./modules/apartments/apartments.routes");
const residentsRoutes = require("./modules/residents/residents.routes");
const staffRoutes = require("./modules/staff/staff.routes");
const documentsRoutes = require("./modules/documents/documents.routes");
const requestsRoutes = require("./modules/requests/requests.routes");
const visitorsRoutes = require("./modules/visitors/visitors.routes");
const announcementsRoutes = require("./modules/announcements/announcements.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");

app.use("/api/auth", authRoutes);
app.use("/api/buildings", buildingsRoutes);
app.use("/api/apartments", apartmentsRoutes);
app.use("/api/residents", residentsRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/visitors", visitorsRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Swagger Documentation Setup
const setupSwagger = require("./docs/swagger");
setupSwagger(app);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error ", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message: message,
  });
});

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;
