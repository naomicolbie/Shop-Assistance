import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { INITIAL_PRODUCTS, Product, FeedbackItem } from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Shared in-memory database of products to support adding and modifying focus groups during session
let productsDb: Product[] = [...INITIAL_PRODUCTS];

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined. AI synthesis will use mock generation.");
}

// REST API Endpoints

// Get all products
app.get("/api/products", (req, res) => {
  res.json(productsDb);
});

// Create a new focus group/product with AI synthesis
app.post("/api/products/analyze", async (req, res) => {
  const { name, categoryInput } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Product name is required" });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Check if already exists
  const existing = productsDb.find(p => p.id === id);
  if (existing) {
    return res.json(existing);
  }

  // Synthesis via Gemini if available, otherwise mock it beautifully
  if (ai) {
    try {
      const prompt = `Perform a comprehensive, realistic affiliate focus group and consumer sentiment analysis for a product named "${name}". 
${categoryInput ? `The general category is "${categoryInput}".` : ""}
Generate realistic metrics, pro/con bullets, competitor benchmarks, consumer tags, and authentic focus group participant reviews with their respective comments and individual scores. Make sure the sentiments and scores are balanced and look professional (e.g. realistic scores with decimal values).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional, elite market research analyst running focus groups. Provide highly realistic feedback datasets that sound authentic and analytical.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "Category of the product, e.g. Tech/Wearables, Audio/Consumer, Home/IoT" },
              description: { type: Type.STRING, description: "A high-quality 1-2 sentence overview of the market research" },
              rating: { type: Type.NUMBER, description: "Overall researcher rating out of 10.0, e.g. 7.9" },
              popularityScore: { type: Type.INTEGER, description: "Popularity score from 1 to 100" },
              sentimentScore: { type: Type.INTEGER, description: "Sentiment score percentage from 1 to 100" },
              goodPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              badPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              competitors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.NUMBER }
                  },
                  required: ["name", "score"]
                }
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              feedback: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the focus group participant" },
                    role: { type: Type.STRING, description: "Their profile, e.g. Casual Gamer, Power User, Commuter" },
                    comment: { type: Type.STRING, description: "A detailed, realistic quote about their actual experience" },
                    score: { type: Type.NUMBER, description: "Their rating out of 10, e.g. 8.5" }
                  },
                  required: ["name", "role", "comment", "score"]
                }
              }
            },
            required: ["category", "description", "rating", "popularityScore", "sentimentScore", "goodPoints", "badPoints", "competitors", "tags", "feedback"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);

        // Convert the generated response to the Product schema
        const newProduct: Product = {
          id,
          name,
          category: parsed.category || categoryInput || "General",
          description: parsed.description || "Synthesized analysis for " + name,
          rating: Number(parsed.rating) || 7.5,
          popularityScore: Number(parsed.popularityScore) || 75,
          sentimentScore: Number(parsed.sentimentScore) || 75,
          liveState: "LIVE NOW",
          hotItem: parsed.rating > 8.0,
          syncStatus: "check_circle",
          participantsCount: Math.floor(Math.random() * 80) + 20,
          goodPoints: parsed.goodPoints || [],
          badPoints: parsed.badPoints || [],
          sources: [
            { name: "Amazon.com", price: Number((Math.random() * 100 + 50).toFixed(2)), updated: "Just now" },
            { name: "Best Buy", price: Number((Math.random() * 100 + 55).toFixed(2)), updated: "Just now" }
          ],
          competitors: parsed.competitors || [],
          tags: (parsed.tags || []).map((t: string) => t.toUpperCase()),
          sentimentTrend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 40),
          feedback: (parsed.feedback || []).map((fb: any, index: number) => ({
            id: `fb-gen-${index}-${Date.now()}`,
            name: fb.name,
            avatarCode: fb.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase(),
            role: fb.role,
            comment: fb.comment,
            status: "COMPLETED",
            score: Number(fb.score) || 7.5
          }))
        };

        productsDb.unshift(newProduct);
        return res.json(newProduct);
      }
    } catch (error) {
      console.error("Gemini API call failed, falling back to mock generation:", error);
    }
  }

  // Robust Mock Generator (when API key is missing or calls fail)
  const score = Number((Math.random() * 3 + 6.5).toFixed(1));
  const newProduct: Product = {
    id,
    name,
    category: categoryInput || "Home & Living",
    description: `A customized sentiment review and focus group metrics report compiled dynamically for the ${name}.`,
    rating: score,
    popularityScore: Math.floor(score * 10),
    sentimentScore: Math.floor(score * 10),
    liveState: "LIVE NOW",
    hotItem: score > 8.2,
    syncStatus: "check_circle",
    participantsCount: Math.floor(Math.random() * 60) + 25,
    goodPoints: [
      { title: "Elegant Design Concept", description: "Testers appreciated the sleek aesthetics and high premium feel." },
      { title: "High Durability", description: "Materials feel robust and capable of enduring daily heavy use easily." },
      { title: "Versatile Form Factor", description: "Adapts perfectly to both compact and spacious setups." }
    ],
    badPoints: [
      { title: "Initial Setup Lag", description: "Some non-technical participants reported difficulty during sync stages." },
      { title: "Steep Learning Curve", description: "Interface controls are sophisticated, requiring reference to documentation." }
    ],
    sources: [
      { name: "Amazon.com", price: Number((Math.random() * 100 + 49).toFixed(2)), updated: "5m ago" },
      { name: "Best Buy", price: Number((Math.random() * 100 + 59).toFixed(2)), updated: "1h ago" }
    ],
    competitors: [
      { name: "Market Average", score: 6.2 },
      { name: "Competitor Alpha", score: Number((score - 0.5).toFixed(1)) },
      { name: "Competitor Beta", score: Number((score + 0.3).toFixed(1)) }
    ],
    tags: ["PREMIUM", "VERSATILE", "MODERN", "STYLISH"],
    sentimentTrend: [50, 55, 62, 68, 70, 78, Math.floor(score * 10)],
    feedback: [
      {
        id: `fb-mock-1-${Date.now()}`,
        name: "David Chen",
        avatarCode: "DC",
        role: "Lead Hardware Reviewer",
        comment: "Outstanding materials and extremely thoughtful form factor. However, the initial firmware pairing was slightly sluggish.",
        status: "COMPLETED",
        score: Number((score + 0.5).toFixed(1))
      },
      {
        id: `fb-mock-2-${Date.now()}`,
        name: "Elena Rostova",
        avatarCode: "ER",
        role: "Product Designer",
        comment: "Incredibly intuitive tactile elements. A joy to use in my workspace daily. The custom colors fit nicely.",
        status: "COMPLETED",
        score: Number((score - 0.2).toFixed(1))
      }
    ]
  };

  productsDb.unshift(newProduct);
  res.json(newProduct);
});

// Run conversion projection model
app.post("/api/insights/projection", async (req, res) => {
  const { productId } = req.body;
  const product = productsDb.find(p => p.id === productId) || productsDb[0];

  if (ai) {
    try {
      const prompt = `Based on the product "${product.name}" which has a focus group rating of ${product.rating}/10 and the positive comments: ${product.goodPoints.map(p => p.title).join(", ")}, synthesize:
1. An estimated conversion lift percentage (e.g., +16.4%)
2. A specific primary target segment (e.g. "hardcore PC gamers", "outdoor endurance runners")
3. A strategic market positioning suggestion.
Keep it very concise, professional, and directly actionable.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite marketing strategist. Return a JSON object with keys: conversionLift (string with plus sign), targetSegment (string), and actionTip (string).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conversionLift: { type: Type.STRING },
              targetSegment: { type: Type.STRING },
              actionTip: { type: Type.STRING }
            },
            required: ["conversionLift", "targetSegment", "actionTip"]
          }
        }
      });

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (e) {
      console.error("Failed to run AI projection model:", e);
    }
  }

  // Fallback
  res.json({
    conversionLift: `+${(Math.random() * 8 + 12).toFixed(1)}%`,
    targetSegment: product.category === "Tech/Wearables" ? "Early Tech Adopters" : "Premium Lifestyle Seekers",
    actionTip: `Target marketing towards ${product.category === "Tech/Wearables" ? "high-intent tech enthusiasts" : "premium users"} using high-density video demonstrations highlighting ${product.goodPoints[0]?.title || "key features"}.`
  });
});

// Generate dynamic consumer trends
app.post("/api/insights/trends", async (req, res) => {
  const categories = Array.from(new Set(productsDb.map(p => p.category)));

  if (ai) {
    try {
      const prompt = `Review these active product focus groups: ${productsDb.map(p => p.name).join(", ")}.
Based on consumer feedback, synthesize:
1. A new, rising market trend (e.g., "Sustainable Packaging", "Modular Design Toggles").
2. A 2-sentence description of the trend and how to exploit it in marketing campaigns.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Return a JSON object with keys: trendTitle (string) and trendDescription (string). Keep it highly analytical.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trendTitle: { type: Type.STRING },
              trendDescription: { type: Type.STRING }
            },
            required: ["trendTitle", "trendDescription"]
          }
        }
      });

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (e) {
      console.error("Failed to synthesize trends:", e);
    }
  }

  res.json({
    trendTitle: "Sustainable Tactility",
    trendDescription: 'Semantic analysis has identified "Sustainable Packaging" and tactile organic frames as a top-3 decision factor for consumers aged 24-35.'
  });
});

// Reset database
app.post("/api/reset", (req, res) => {
  productsDb = [...INITIAL_PRODUCTS];
  res.json({ success: true });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
