import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { type User, type InsertUser, type ActivityLog, type InsertActivityLog, type SecurityEvent, type InsertSecurityEvent } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  
  // Activity log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number, offset?: number): Promise<ActivityLog[]>;
  
  // Security event operations
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;
  getSecurityEvents(limit?: number): Promise<SecurityEvent[]>;
  getUnresolvedSecurityEvents(): Promise<SecurityEvent[]>;
  
  // Dashboard metrics
  getActiveUsersCount(): Promise<number>;
  getFailedLoginsCount(hours?: number): Promise<number>;
  getSecurityEventsCount(hours?: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private activityLogs: Map<string, ActivityLog>;
  private securityEvents: Map<string, SecurityEvent>;

  constructor() {
    this.users = new Map();
    this.activityLogs = new Map();
    this.securityEvents = new Map();
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    // Create default admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@company.com",
      password: adminPassword,
      role: "admin",
      firstName: "John",
      lastName: "Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(admin.id, admin);

    // Create default viewer user
    const viewerPassword = await bcrypt.hash("viewer123", 10);
    const viewer: User = {
      id: randomUUID(),
      username: "viewer",
      email: "viewer@company.com",
      password: viewerPassword,
      role: "viewer",
      firstName: "Jane",
      lastName: "Viewer",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(viewer.id, viewer);

    // Add some sample activity logs
    this.createSampleData();
  }

  private createSampleData() {
    // Sample activity logs
    const sampleLogs = [
      {
        userId: Array.from(this.users.values())[0]?.id || null,
        username: "admin@company.com",
        action: "User login",
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        status: "success",
      },
      {
        userId: Array.from(this.users.values())[1]?.id || null,
        username: "viewer@company.com",
        action: "Dashboard access",
        ipAddress: "192.168.1.103",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        status: "success",
      },
      {
        userId: null,
        username: "unknown@domain.com",
        action: "Failed login attempt",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        status: "failed",
      },
    ];

    sampleLogs.forEach(log => {
      const activityLog: ActivityLog = {
        id: randomUUID(),
        ...log,
        timestamp: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
      };
      this.activityLogs.set(activityLog.id, activityLog);
    });

    // Sample security events
    const sampleEvents = [
      {
        type: "security_alert",
        description: "Multiple failed login attempts detected",
        severity: "warning",
        ipAddress: "192.168.1.100",
        userId: null,
        resolved: false,
      },
      {
        type: "system_update",
        description: "Security patch successfully applied",
        severity: "info",
        ipAddress: null,
        userId: null,
        resolved: true,
      },
      {
        type: "user_created",
        description: "New user account created",
        severity: "info",
        ipAddress: "192.168.1.105",
        userId: Array.from(this.users.values())[0]?.id,
        resolved: true,
      },
    ];

    sampleEvents.forEach(event => {
      const securityEvent: SecurityEvent = {
        id: randomUUID(),
        ...event,
        timestamp: new Date(Date.now() - Math.random() * 7200000), // Random time in last 2 hours
      };
      this.securityEvents.set(securityEvent.id, securityEvent);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = { 
      ...insertUser, 
      id, 
      password: hashedPassword,
      role: insertUser.role || "viewer",
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const activityLog: ActivityLog = {
      ...log,
      id,
      userId: log.userId || null,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      status: log.status || "success",
      timestamp: new Date(),
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }

  async getActivityLogs(limit = 10, offset = 0): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values())
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(offset, offset + limit);
    return logs;
  }

  async createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent> {
    const id = randomUUID();
    const securityEvent: SecurityEvent = {
      ...event,
      id,
      userId: event.userId || null,
      ipAddress: event.ipAddress || null,
      severity: event.severity || "info",
      resolved: event.resolved || false,
      timestamp: new Date(),
    };
    this.securityEvents.set(id, securityEvent);
    return securityEvent;
  }

  async getSecurityEvents(limit = 10): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values())
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async getUnresolvedSecurityEvents(): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values())
      .filter(event => !event.resolved)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async getActiveUsersCount(): Promise<number> {
    // Simulate active users count
    return 1234;
  }

  async getFailedLoginsCount(hours = 24): Promise<number> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.activityLogs.values())
      .filter(log => log.status === "failed" && log.timestamp && log.timestamp >= cutoff)
      .length;
  }

  async getSecurityEventsCount(hours = 24): Promise<number> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.securityEvents.values())
      .filter(event => event.timestamp && event.timestamp >= cutoff)
      .length;
  }
}

export const storage = new MemStorage();
