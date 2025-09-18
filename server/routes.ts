import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { loginSchema, insertActivityLogSchema, insertSecurityEventSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// Middleware to verify JWT token
async function verifyToken(req: any, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// Middleware to check role permissions
function requireRole(role: string) {
  return (req: any, res: Response, next: Function) => {
    if (req.user.role !== role && role !== "any") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

// Helper to get client IP
function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.socket.remoteAddress || 
         'unknown';
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const ipAddress = getClientIP(req);
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user || !(await bcrypt.compare(password, user.password))) {
        // Log failed login attempt
        await storage.createActivityLog({
          userId: null,
          username,
          action: "Failed login attempt",
          ipAddress,
          userAgent,
          status: "failed",
        });

        // Create security event for failed login
        await storage.createSecurityEvent({
          type: "login_attempt",
          description: `Failed login attempt for user: ${username}`,
          severity: "warning",
          ipAddress,
          userId: null,
        });

        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Log successful login
      await storage.createActivityLog({
        userId: user.id,
        username: user.email || user.username,
        action: "User login",
        ipAddress,
        userAgent,
        status: "success",
      });

      // Return user info and token
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", verifyToken, async (req: any, res: Response) => {
    try {
      const ipAddress = getClientIP(req);
      
      await storage.createActivityLog({
        userId: req.user.id,
        username: req.user.email || req.user.username,
        action: "User logout",
        ipAddress,
        userAgent: req.headers['user-agent'] || 'unknown',
        status: "success",
      });

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", verifyToken, async (req: any, res: Response) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", verifyToken, async (req: any, res: Response) => {
    try {
      const [activeUsers, failedLogins, securityEvents] = await Promise.all([
        storage.getActiveUsersCount(),
        storage.getFailedLoginsCount(24),
        storage.getSecurityEventsCount(24),
      ]);

      res.json({
        activeUsers,
        failedLogins,
        securityEvents,
        uptime: 99.8, // Mock system uptime
      });
    } catch (error) {
      console.error("Metrics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activity logs
  app.get("/api/activity-logs", verifyToken, async (req: any, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const logs = await storage.getActivityLogs(limit, offset);
      res.json(logs);
    } catch (error) {
      console.error("Activity logs error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Security events
  app.get("/api/security-events", verifyToken, async (req: any, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getSecurityEvents(limit);
      res.json(events);
    } catch (error) {
      console.error("Security events error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/security-events/unresolved", verifyToken, requireRole("admin"), async (req: any, res: Response) => {
    try {
      const events = await storage.getUnresolvedSecurityEvents();
      res.json(events);
    } catch (error) {
      console.error("Unresolved security events error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User management - admin only
  app.get("/api/admin/users", verifyToken, requireRole("admin"), async (_req: any, res: Response) => {
    try {
      const users = await storage.listUsers();
      const sanitized = users.map(({ password, ...u }) => u);
      res.json(sanitized);
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
