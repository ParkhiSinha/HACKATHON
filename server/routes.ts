import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import * as crypto from "crypto";
import MemoryStore from "memorystore";
import { 
  insertUserSchema, 
  insertCrimeReportSchema, 
  insertTeamSchema, 
  insertEmergencySignalSchema
} from "@shared/schema";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time emergency signals
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws", // Explicitly set the WebSocket path
    clientTracking: true,
    // Adding a ping interval to keep connections alive
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Below options specified as default values
      concurrencyLimit: 10,
      threshold: 1024 // Size in bytes below which messages should not be compressed
    }
  });
  
  const clients = new Set<any>();
  
  wss.on("connection", (ws, req) => {
    console.log(`WebSocket client connected from ${req.socket.remoteAddress}`);
    clients.add(ws);
    
    // Send a test message to confirm connection
    try {
      ws.send(JSON.stringify({ type: "CONNECTED", message: "WebSocket connection established" }));
    } catch (err) {
      console.error("Failed to send welcome message:", err);
    }
    
    // Set up a ping interval to keep the connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        try {
          ws.ping();
        } catch (err) {
          console.error("Ping failed:", err);
        }
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
    
    ws.on("message", (message) => {
      try {
        console.log(`Received message from client: ${message}`);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });
    
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      // Don't try to close on error - just let the connection die naturally
    });
    
    ws.on("close", (code, reason) => {
      console.log(`WebSocket client disconnected: ${code} ${reason}`);
      clearInterval(pingInterval);
      clients.delete(ws);
    });
  });
  
  // Helper function to broadcast to all connected clients
  const broadcast = (data: any) => {
    console.log(`Broadcasting to ${clients.size} clients:`, data);
    clients.forEach(client => {
      try {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error broadcasting message:", error);
      }
    });
  };
  
  // Session setup
  app.use(
    session({
      secret: "crime-reporting-app-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      cookie: { 
        // Setting secure to false for Replit environment to ensure cookies work properly
        secure: false,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
        path: '/'
      }
    })
  );
  
  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Password hashing function
  const hashPassword = (password: string): string => {
    return crypto.createHash("sha256").update(password).digest("hex");
  };
  
  // Passport strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "User not found" });
        
        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
          // In real app, use bcrypt.compare() instead of direct comparison
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  const isPolice = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && (req.user as any).role === "police") {
      return next();
    }
    res.status(403).json({ message: "Forbidden: Police access only" });
  };
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: validationResult.error.format() });
      }
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const userData = { 
        ...req.body,
        password: hashPassword(req.body.password)
      };
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message || "Authentication failed" });
      
      req.logIn(user, (err) => {
        if (err) return next(err);
        
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not logged in" });
    }
    
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });
  
  // Crime reports routes
  app.get("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      let reports;
      
      if (user.role === "police") {
        reports = await storage.getAllCrimeReports();
      } else {
        reports = await storage.getCrimeReportsByUser(user.id);
      }
      
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/reports/:id", isAuthenticated, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getCrimeReport(reportId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "police" && report.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden: You do not have access to this report" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertCrimeReportSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: validationResult.error.format() });
      }
      
      const user = req.user as any;
      const reportData = {
        ...req.body,
        userId: user.id
      };
      
      const report = await storage.createCrimeReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/reports/:id/status", isPolice, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status || !["pending", "in_progress", "resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const reportId = parseInt(req.params.id);
      const updatedReport = await storage.updateCrimeReportStatus(reportId, status);
      
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/reports/:id/team", isPolice, async (req, res) => {
    try {
      const { teamId } = req.body;
      
      if (!teamId) {
        return res.status(400).json({ message: "Team ID is required" });
      }
      
      const reportId = parseInt(req.params.id);
      const updatedReport = await storage.assignTeamToCrimeReport(reportId, teamId);
      
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error assigning team to report:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Teams routes
  app.get("/api/teams", isPolice, async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/teams/:id", isPolice, async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/teams", isPolice, async (req, res) => {
    try {
      const validationResult = insertTeamSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: validationResult.error.format() });
      }
      
      const team = await storage.createTeam(req.body);
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/teams/:id/status", isPolice, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status || !["available", "assigned", "on_scene", "en_route"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const teamId = parseInt(req.params.id);
      const updatedTeam = await storage.updateTeamStatus(teamId, status);
      
      if (!updatedTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(updatedTeam);
    } catch (error) {
      console.error("Error updating team status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Emergency signal routes
  app.get("/api/emergency", isPolice, async (req, res) => {
    try {
      const signals = await storage.getActiveEmergencySignals();
      res.json(signals);
    } catch (error) {
      console.error("Error fetching emergency signals:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/emergency", isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertEmergencySignalSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: validationResult.error.format() });
      }
      
      const user = req.user as any;
      const signalData = {
        ...req.body,
        userId: user.id
      };
      
      const signal = await storage.createEmergencySignal(signalData);
      
      // Get user information for the broadcast
      const userData = await storage.getUser(user.id);
      
      // Broadcast the emergency signal to all connected clients
      const broadcastData = {
        type: "EMERGENCY_SIGNAL",
        data: {
          ...signal,
          user: {
            id: userData?.id,
            fullName: userData?.fullName
          }
        }
      };
      
      broadcast(broadcastData);
      
      res.status(201).json(signal);
    } catch (error) {
      console.error("Error creating emergency signal:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/emergency/:id/resolve", isPolice, async (req, res) => {
    try {
      const signalId = parseInt(req.params.id);
      const updatedSignal = await storage.resolveEmergencySignal(signalId);
      
      if (!updatedSignal) {
        return res.status(404).json({ message: "Emergency signal not found" });
      }
      
      // Broadcast the resolution to all connected clients
      const broadcastData = {
        type: "EMERGENCY_RESOLVED",
        data: updatedSignal
      };
      
      broadcast(broadcastData);
      
      res.json(updatedSignal);
    } catch (error) {
      console.error("Error resolving emergency signal:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
