require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const { clerkMiddleware } = require("@clerk/express");
const { connectToMongoDB } = require("./connect");
const { errorHandler } = require("./middlewares/error");
const URL = require("./models/url");
const Visit = require("./models/visit");
const UAParser = require("ua-parser-js");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");

const app = express();
const PORT = 8001;

connectToMongoDB(process.env.MONGODB ?? "mongodb://localhost:27017/short-url").then(() =>
  console.log("Mongodb connected")
);

// Set Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Request Logging
app.use(morgan("dev"));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Rate Limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/url", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(clerkMiddleware());

app.use("/url", urlRoute);
app.use("/", staticRoute);

app.get("/url/:shortId", async (req, res, next) => {
  const shortId = req.params.shortId;
  try {
    const entry = await URL.findOne({ shortId });
    if (!entry) return res.status(404).send("Link not found");

    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Expired - QuickLink</title>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            :root {
              --bg: #030712;
              --card: #0b0f19;
              --text: #f3f4f6;
              --muted: #9ca3af;
              --border: rgba(255, 255, 255, 0.08);
            }
            body {
              margin: 0;
              padding: 24px;
              font-family: 'Plus Jakarta Sans', sans-serif;
              background-color: var(--bg);
              color: var(--text);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: calc(100vh - 48px);
              overflow: hidden;
            }
            /* Ambient background glow */
            body::before {
              content: '';
              position: absolute;
              top: -10%;
              left: -10%;
              width: 50%;
              height: 50%;
              background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
              filter: blur(80px);
              pointer-events: none;
            }
            .container {
              text-align: center;
              max-width: 440px;
              padding: 48px 32px;
              border: 1px solid var(--border);
              background-color: var(--card);
              border-radius: 28px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              position: relative;
              z-index: 10;
              box-sizing: border-box;
            }
            .container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(to right, #6366f1, #a855f7);
              border-radius: 28px 28px 0 0;
            }
            .icon {
              font-size: 56px;
              margin-bottom: 24px;
              display: inline-block;
              animation: float 3s ease-in-out infinite;
            }
            h1 {
              font-size: 24px;
              font-weight: 800;
              margin: 0 0 12px 0;
              letter-spacing: -0.025em;
              background: linear-gradient(to right, #f3f4f6, #9ca3af);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              font-size: 13.5px;
              color: var(--muted);
              line-height: 1.6;
              margin: 0 0 32px 0;
            }
            .btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              padding: 14px 28px;
              background: linear-gradient(to right, #6366f1, #4f46e5);
              color: white;
              text-decoration: none;
              font-weight: 600;
              border-radius: 14px;
              font-size: 13.5px;
              transition: all 0.2s ease;
              box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
              box-sizing: border-box;
            }
            .btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 12px 20px -3px rgba(99, 102, 241, 0.4);
              background: linear-gradient(to right, #4f46e5, #4338ca);
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⏰</div>
            <h1>Link Has Expired</h1>
            <p>The shortened URL you are trying to visit has reached its scheduled expiration date and is no longer active. If you are the owner, you can extend its duration from your dashboard.</p>
            <a href="http://localhost:5173" class="btn">Return to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Parse user-agent
    const parser = new UAParser(req.headers["user-agent"]);
    const parserResult = parser.getResult();

    let browser = parserResult.browser.name || "Unknown";
    const secChUa = req.headers["sec-ch-ua"];
    if (secChUa && secChUa.includes("Brave")) {
      browser = "Brave";
    }

    const os = parserResult.os.name || "Unknown";
    let device = parserResult.device.type || "Desktop";
    if (device === undefined || device === "desktop") {
      device = "Desktop";
    } else {
      device = device.charAt(0).toUpperCase() + device.slice(1);
    }

    // Get Referrer
    let referrer = "Direct";
    const rawReferrer = req.headers["referer"] || req.headers["referrer"];
    if (rawReferrer) {
      try {
        const urlObj = new URL(rawReferrer);
        referrer = urlObj.hostname;
      } catch (e) {
        referrer = rawReferrer;
      }
    }

    // Parse IP & Geolocations
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    const isLocalIp = ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127") || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.");

    let country = isLocalIp ? "India" : "Unknown";
    let city = isLocalIp ? "Mumbai" : "Unknown";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const geoUrl = isLocalIp ? "http://ip-api.com/json/" : `http://ip-api.com/json/${ip}`;
      const geoResponse = await fetch(geoUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (geoResponse.ok) {
        const data = await geoResponse.json();
        if (data && data.status === "success") {
          country = data.country || (isLocalIp ? "India" : "Unknown");
          city = data.city || (isLocalIp ? "Mumbai" : "Unknown");
        }
      }
    } catch (err) {
      console.error("Geo-IP lookup failed for IP:", ip, err.message);
    }

    // Create Visit log
    await Visit.create({
      shortId,
      browser,
      device,
      os,
      referrer,
      country,
      city,
      ip,
    });

    // Increment click counts
    entry.clicksCount = (entry.clicksCount || 0) + 1;
    await entry.save();

    return res.redirect(entry.redirectURL);
  } catch (error) {
    next(error);
  }
});

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
