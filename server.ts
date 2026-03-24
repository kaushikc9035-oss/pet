import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "petfinder-secret-key";
const DATA_FILE = path.join(__dirname, "data", "db.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// In-memory database fallback for Vercel/Serverless
let memoryDB = { users: [], lostPets: [], foundPets: [] };

// Database helpers
const readDB = () => {
  if (process.env.VERCEL) return memoryDB;
  try {
    if (!fs.existsSync(DATA_FILE)) return memoryDB;
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    return memoryDB;
  }
};

const writeDB = (data: any) => {
  memoryDB = data;
  if (!process.env.VERCEL) {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Failed to write to disk:", e);
    }
  }
};

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

// Multer setup - Use memory storage for Vercel
const storage = process.env.VERCEL 
  ? multer.memoryStorage() 
  : multer.diskStorage({
      destination: (req, file, cb) => {
        if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        cb(null, UPLOADS_DIR);
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
      },
    });

const upload = multer({ storage });

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- API Routes ---
app.get("/api/health", (req, res) => res.json({ status: "ok", env: process.env.VERCEL ? "vercel" : "local" }));

app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;
  const db = readDB();
  if (db.users.find((u: any) => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), email, password: hashedPassword, name };
  db.users.push(newUser);
  writeDB(db);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET);
  res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find((u: any) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post("/api/pets/report", authenticate, upload.array("images", 5), (req: any, res) => {
  const { type, petType, petName, breed, color, location, lat, lng, dateTime, contact, urgency } = req.body;
  
  let images: string[] = [];
  if (process.env.VERCEL) {
    images = (req.files as any[]).map(f => `data:${f.mimetype};base64,${f.buffer.toString("base64")}`);
  } else {
    images = (req.files as Express.Multer.File[]).map(f => `/uploads/${f.filename}`);
  }
  
  const db = readDB();
  const newPet = {
    id: Date.now().toString(),
    userId: req.user.id,
    petType,
    petName,
    breed,
    color,
    location,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    dateTime,
    contact,
    images,
    urgency,
    status: "active",
    createdAt: new Date().toISOString()
  };

  const collection = type === "lost" ? "lostPets" : "foundPets";
  db[collection].push(newPet);
  
  const otherCollection = type === "lost" ? "foundPets" : "lostPets";
  const matches = db[otherCollection].filter((p: any) => {
    const sameType = p.petType.toLowerCase() === petType.toLowerCase();
    const sameBreed = p.breed.toLowerCase() === breed.toLowerCase();
    const dist = Math.sqrt(Math.pow(p.lat - lat, 2) + Math.pow(p.lng - lng, 2));
    return sameType && (sameBreed || dist < 0.1);
  });

  writeDB(db);
  res.json({ pet: newPet, matches });
});

app.get("/api/pets", (req, res) => {
  const { type, petType, breed, color } = req.query;
  const db = readDB();
  let pets = type === "lost" ? db.lostPets : type === "found" ? db.foundPets : [...db.lostPets, ...db.foundPets];
  
  if (petType) pets = pets.filter((p: any) => p.petType === petType);
  if (breed) pets = pets.filter((p: any) => p.breed.toLowerCase().includes((breed as string).toLowerCase()));
  if (color) pets = pets.filter((p: any) => p.color.toLowerCase().includes((color as string).toLowerCase()));
  
  res.json(pets);
});

app.patch("/api/pets/:id/reunited", authenticate, (req: any, res) => {
  const { id } = req.params;
  const db = readDB();
  const lostPet = db.lostPets.find((p: any) => p.id === id && p.userId === req.user.id);
  const foundPet = db.foundPets.find((p: any) => p.id === id && p.userId === req.user.id);
  
  if (lostPet) lostPet.status = "reunited";
  else if (foundPet) foundPet.status = "reunited";
  else return res.status(404).json({ error: "Pet not found or unauthorized" });
  
  writeDB(db);
  res.json({ message: "Marked as reunited" });
});

// --- API 404 Handler ---
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// --- Global API Error Handler ---
app.use("/api", (err: any, req: any, res: any, next: any) => {
  console.error("API Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// --- Local Development Setup ---
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("join_room", (roomId) => socket.join(roomId));
    socket.on("send_message", (data) => io.to(data.roomId).emit("receive_message", data));
  });

  const startLocalServer = async () => {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Local server running on http://localhost:${PORT}`);
    });
  };
  
  startLocalServer();
}

export default app;
