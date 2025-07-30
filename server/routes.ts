import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDesignSchema, insertPatternSchema } from "@shared/schema";
import { z } from "zod";
import FormData from "form-data";

export async function registerRoutes(app: Express): Promise<Server> {
  // Designs routes
  app.get("/api/designs", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const designs = await storage.getDesignsByUserId(userId);
      res.json(designs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });

  app.get("/api/designs/:id", async (req, res) => {
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

  app.post("/api/designs", async (req, res) => {
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

  app.put("/api/designs/:id", async (req, res) => {
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

  app.delete("/api/designs/:id", async (req, res) => {
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

  // Patterns routes
  app.get("/api/patterns/public", async (req, res) => {
    try {
      const patterns = await storage.getPublicPatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patterns" });
    }
  });

  app.get("/api/patterns/category/:category", async (req, res) => {
    try {
      const patterns = await storage.getPatternsByCategory(req.params.category);
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patterns" });
    }
  });

  app.get("/api/patterns/user/:userId", async (req, res) => {
    try {
      const patterns = await storage.getUserPatterns(req.params.userId);
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user patterns" });
    }
  });

  app.post("/api/patterns", async (req, res) => {
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

  // AI Pattern Generation endpoint with Stability AI
  app.post("/api/patterns/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || prompt.trim().length === 0) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const stabilityApiKey = process.env.STABILITY_API_KEY;
      if (!stabilityApiKey) {
        return res.status(500).json({ message: "Stability AI API key not configured" });
      }

      // Generate pattern using Stability AI
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${stabilityApiKey}`,
          'Accept': 'application/json'
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
        console.error('Stability AI API error:', response.status, errorData);
        return res.status(500).json({ message: 'Failed to generate pattern with AI' });
      }

      const result = await response.json();
      const imageBase64 = result.artifacts[0].base64;
      
      // Convert to SVG pattern for seamless tiling
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
      console.error('AI pattern generation error:', error);
      res.status(500).json({ message: "Failed to generate pattern" });
    }
  });

  // Image refinement endpoint using Stability AI
  app.post("/api/refine-image", async (req, res) => {
    try {
      const { imageData, prompt = "clean refined rug pattern, no noise or dots, smooth edges" } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
      if (!STABILITY_API_KEY) {
        return res.status(500).json({ error: 'Stability API key not configured' });
      }

      // Convert base64 to buffer
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Create form data for Stability AI API
      const form = new FormData();
      form.append('init_image', imageBuffer, { filename: 'image.png', contentType: 'image/png' });
      form.append('text_prompts[0][text]', prompt);
      form.append('text_prompts[0][weight]', '1');
      form.append('image_strength', '0.35');
      form.append('cfg_scale', '7');
      form.append('steps', '20');
      form.append('samples', '1');

      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'image/*',
          ...form.getHeaders()
        },
        body: form as any
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stability AI error:', errorText);
        return res.status(500).json({ error: 'Image refinement failed' });
      }

      // Parse JSON response for v1 API
      const result = await response.json();
      const imageBase64 = result.artifacts[0].base64;
      const refinedImageData = `data:image/png;base64,${imageBase64}`;

      res.json({ refinedImage: refinedImageData });

    } catch (error) {
      console.error('Image refinement error:', error);
      res.status(500).json({ error: 'Internal server error during image refinement' });
    }
  });

  // Image processing endpoint (stubbed for now)
  app.post("/api/images/process", async (req, res) => {
    try {
      const { imageData, operation } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }

      // Stub for image processing - would use Sharp library
      // For now, just return the original image data
      res.json({ 
        processedImageData: imageData,
        operation: operation || "none"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
