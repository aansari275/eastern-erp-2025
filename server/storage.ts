import { type User, type InsertUser, type Design, type InsertDesign, type Pattern, type InsertPattern } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDesign(id: string): Promise<Design | undefined>;
  getDesignsByUserId(userId: string): Promise<Design[]>;
  createDesign(design: InsertDesign): Promise<Design>;
  updateDesign(id: string, design: Partial<InsertDesign>): Promise<Design | undefined>;
  deleteDesign(id: string): Promise<boolean>;
  
  getPattern(id: string): Promise<Pattern | undefined>;
  getPatternsByCategory(category: string): Promise<Pattern[]>;
  getPublicPatterns(): Promise<Pattern[]>;
  getUserPatterns(userId: string): Promise<Pattern[]>;
  createPattern(pattern: InsertPattern): Promise<Pattern>;
  deletePattern(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private designs: Map<string, Design>;
  private patterns: Map<string, Pattern>;

  constructor() {
    this.users = new Map();
    this.designs = new Map();
    this.patterns = new Map();
    
    // Initialize with some default patterns
    this.initializeDefaultPatterns();
  }

  private initializeDefaultPatterns() {
    const defaultPatterns: Pattern[] = [
      {
        id: randomUUID(),
        name: "Circle",
        category: "geometric",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="currentColor"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Square",
        category: "geometric",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" fill="currentColor"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Triangle",
        category: "geometric",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,90 10,90" fill="currentColor"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Leaf",
        category: "nature",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,10 Q90,30 80,70 Q70,90 50,90 Q30,90 20,70 Q10,30 50,10 Z" fill="currentColor"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Flower",
        category: "nature",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><circle cx="50" cy="30" r="15"/><circle cx="70" cy="50" r="15"/><circle cx="50" cy="70" r="15"/><circle cx="30" cy="50" r="15"/><circle cx="50" cy="50" r="10"/></g></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Dots",
        category: "texture",
        svgData: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="3" fill="currentColor"/></pattern><rect width="100" height="100" fill="url(#dots)"/></svg>`,
        userId: null,
        isPublic: "true",
        createdAt: new Date(),
      },
    ];

    defaultPatterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getDesign(id: string): Promise<Design | undefined> {
    return this.designs.get(id);
  }

  async getDesignsByUserId(userId: string): Promise<Design[]> {
    return Array.from(this.designs.values()).filter(design => design.userId === userId);
  }

  async createDesign(insertDesign: InsertDesign): Promise<Design> {
    const id = randomUUID();
    const now = new Date();
    const design: Design = { 
      ...insertDesign, 
      id, 
      createdAt: now, 
      updatedAt: now,
      thumbnail: insertDesign.thumbnail || null
    };
    this.designs.set(id, design);
    return design;
  }

  async updateDesign(id: string, updateData: Partial<InsertDesign>): Promise<Design | undefined> {
    const existing = this.designs.get(id);
    if (!existing) return undefined;
    
    const updated: Design = { ...existing, ...updateData, updatedAt: new Date() };
    this.designs.set(id, updated);
    return updated;
  }

  async deleteDesign(id: string): Promise<boolean> {
    return this.designs.delete(id);
  }

  async getPattern(id: string): Promise<Pattern | undefined> {
    return this.patterns.get(id);
  }

  async getPatternsByCategory(category: string): Promise<Pattern[]> {
    return Array.from(this.patterns.values()).filter(pattern => pattern.category === category);
  }

  async getPublicPatterns(): Promise<Pattern[]> {
    return Array.from(this.patterns.values()).filter(pattern => pattern.isPublic === "true");
  }

  async getUserPatterns(userId: string): Promise<Pattern[]> {
    return Array.from(this.patterns.values()).filter(pattern => pattern.userId === userId);
  }

  async createPattern(insertPattern: InsertPattern): Promise<Pattern> {
    const id = randomUUID();
    const pattern: Pattern = { 
      ...insertPattern, 
      id, 
      createdAt: new Date(),
      userId: insertPattern.userId || null,
      isPublic: insertPattern.isPublic || "false"
    };
    this.patterns.set(id, pattern);
    return pattern;
  }

  async deletePattern(id: string): Promise<boolean> {
    return this.patterns.delete(id);
  }
}

export const storage = new MemStorage();
