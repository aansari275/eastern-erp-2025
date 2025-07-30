// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  designs;
  patterns;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.designs = /* @__PURE__ */ new Map();
    this.patterns = /* @__PURE__ */ new Map();
    this.initializeDefaultPatterns();
  }
  initializeDefaultPatterns() {
    const defaultPatterns = [
      {
        id: randomUUID(),
        name: "Circle",
        category: "geometric",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="currentColor"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: randomUUID(),
        name: "Square",
        category: "geometric",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" fill="currentColor"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: randomUUID(),
        name: "Triangle",
        category: "geometric",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,90 10,90" fill="currentColor"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: randomUUID(),
        name: "Leaf",
        category: "nature",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,10 Q90,30 80,70 Q70,90 50,90 Q30,90 20,70 Q10,30 50,10 Z" fill="currentColor"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: randomUUID(),
        name: "Flower",
        category: "nature",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><circle cx="50" cy="30" r="15"/><circle cx="70" cy="50" r="15"/><circle cx="50" cy="70" r="15"/><circle cx="30" cy="50" r="15"/><circle cx="50" cy="50" r="10"/></g></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: randomUUID(),
        name: "Dots",
        category: "texture",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="3" fill="currentColor"/></pattern><rect width="100" height="100" fill="url(#dots)"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    defaultPatterns.forEach((pattern) => {
      this.patterns.set(pattern.id, pattern);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id, createdAt: /* @__PURE__ */ new Date() };
    this.users.set(id, user);
    return user;
  }
  async getDesign(id) {
    return this.designs.get(id);
  }
  async getDesignsByUserId(userId) {
    return Array.from(this.designs.values()).filter((design) => design.userId === userId);
  }
  async createDesign(insertDesign) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const design = {
      ...insertDesign,
      id,
      createdAt: now,
      updatedAt: now,
      thumbnail: insertDesign.thumbnail || null
    };
    this.designs.set(id, design);
    return design;
  }
  async updateDesign(id, updateData) {
    const existing = this.designs.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updateData, updatedAt: /* @__PURE__ */ new Date() };
    this.designs.set(id, updated);
    return updated;
  }
  async deleteDesign(id) {
    return this.designs.delete(id);
  }
  async getPattern(id) {
    return this.patterns.get(id);
  }
  async getPatternsByCategory(category) {
    return Array.from(this.patterns.values()).filter((pattern) => pattern.category === category);
  }
  async getPublicPatterns() {
    return Array.from(this.patterns.values()).filter((pattern) => pattern.isPublic === "true");
  }
  async getUserPatterns(userId) {
    return Array.from(this.patterns.values()).filter((pattern) => pattern.userId === userId);
  }
  async createPattern(insertPattern) {
    const id = randomUUID();
    const pattern = {
      ...insertPattern,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      userId: insertPattern.userId || null,
      isPublic: insertPattern.isPublic || "false"
    };
    this.patterns.set(id, pattern);
    return pattern;
  }
  async deletePattern(id) {
    return this.patterns.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
});
var designs = pgTable("designs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  canvasData: jsonb("canvas_data").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var patterns = pgTable("patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  svgData: text("svg_data").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  isPublic: text("is_public").notNull().default("false"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertDesignSchema = createInsertSchema(designs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPatternSchema = createInsertSchema(patterns).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
import { z } from "zod";
import FormData from "form-data";
async function registerRoutes(app2) {
  app2.get("/api/designs", async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const designs2 = await storage.getDesignsByUserId(userId);
      res.json(designs2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });
  app2.get("/api/designs/:id", async (req, res) => {
    try {
      const design = await storage.getDesign(req.params.id);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json(design);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch design" });
    }
  });
  app2.post("/api/designs", async (req, res) => {
    try {
      const validatedData = insertDesignSchema.parse(req.body);
      const design = await storage.createDesign(validatedData);
      res.status(201).json(design);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid design data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create design" });
    }
  });
  app2.put("/api/designs/:id", async (req, res) => {
    try {
      const validatedData = insertDesignSchema.partial().parse(req.body);
      const design = await storage.updateDesign(req.params.id, validatedData);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json(design);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid design data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update design" });
    }
  });
  app2.delete("/api/designs/:id", async (req, res) => {
    try {
      const success = await storage.deleteDesign(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete design" });
    }
  });
  app2.get("/api/patterns/public", async (req, res) => {
    try {
      const patterns2 = await storage.getPublicPatterns();
      res.json(patterns2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patterns" });
    }
  });
  app2.get("/api/patterns/category/:category", async (req, res) => {
    try {
      const patterns2 = await storage.getPatternsByCategory(req.params.category);
      res.json(patterns2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patterns" });
    }
  });
  app2.get("/api/patterns/user/:userId", async (req, res) => {
    try {
      const patterns2 = await storage.getUserPatterns(req.params.userId);
      res.json(patterns2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user patterns" });
    }
  });
  app2.post("/api/patterns", async (req, res) => {
    try {
      const validatedData = insertPatternSchema.parse(req.body);
      const pattern = await storage.createPattern(validatedData);
      res.status(201).json(pattern);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pattern data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pattern" });
    }
  });
  app2.post("/api/patterns/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || prompt.trim().length === 0) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      const stabilityApiKey = process.env.STABILITY_API_KEY;
      if (!stabilityApiKey) {
        return res.status(500).json({ message: "Stability AI API key not configured" });
      }
      const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${stabilityApiKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          text_prompts: [{
            text: `${prompt}, seamless pattern, tileable, high quality, geometric design, suitable for textiles and rugs`,
            weight: 1
          }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
          style_preset: "tile-texture"
        })
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Stability AI API error:", response.status, errorData);
        return res.status(500).json({ message: "Failed to generate pattern with AI" });
      }
      const result = await response.json();
      const imageBase64 = result.artifacts[0].base64;
      const patternId = `aiPattern${Date.now()}`;
      const svgData = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="${patternId}" x="0" y="0" width="1024" height="1024" patternUnits="userSpaceOnUse">
            <image href="data:image/png;base64,${imageBase64}" x="0" y="0" width="1024" height="1024"/>
          </pattern>
        </defs>
        <rect width="1024" height="1024" fill="url(#${patternId})"/>
      </svg>`;
      res.json({ svgData, prompt });
    } catch (error) {
      console.error("AI pattern generation error:", error);
      res.status(500).json({ message: "Failed to generate pattern" });
    }
  });
  app2.post("/api/refine-image", async (req, res) => {
    try {
      const { imageData, prompt = "clean refined rug pattern, no noise or dots, smooth edges" } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "Image data is required" });
      }
      const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
      if (!STABILITY_API_KEY) {
        return res.status(500).json({ error: "Stability API key not configured" });
      }
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      const form = new FormData();
      form.append("init_image", imageBuffer, { filename: "image.png", contentType: "image/png" });
      form.append("text_prompts[0][text]", prompt);
      form.append("text_prompts[0][weight]", "1");
      form.append("image_strength", "0.35");
      form.append("cfg_scale", "7");
      form.append("steps", "20");
      form.append("samples", "1");
      const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${STABILITY_API_KEY}`,
          "Accept": "image/*",
          ...form.getHeaders()
        },
        body: form
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Stability AI error:", errorText);
        return res.status(500).json({ error: "Image refinement failed" });
      }
      const result = await response.json();
      const imageBase64 = result.artifacts[0].base64;
      const refinedImageData = `data:image/png;base64,${imageBase64}`;
      res.json({ refinedImage: refinedImageData });
    } catch (error) {
      console.error("Image refinement error:", error);
      res.status(500).json({ error: "Internal server error during image refinement" });
    }
  });
  app2.post("/api/images/process", async (req, res) => {
    try {
      const { imageData, operation } = req.body;
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }
      res.json({
        processedImageData: imageData,
        operation: operation || "none"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process image" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        if (process.env.NODE_ENV !== "production") {
          console.error("Vite error:", msg);
        }
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "localhost", () => {
    log(`serving on port ${port}`);
  });
})();
