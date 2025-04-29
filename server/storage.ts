import { 
  users, User, InsertUser, 
  crimeReports, CrimeReport, InsertCrimeReport,
  teams, Team, InsertTeam,
  emergencySignals, EmergencySignal, InsertEmergencySignal
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Crime report operations
  getCrimeReport(id: number): Promise<CrimeReport | undefined>;
  getCrimeReportsByUser(userId: number): Promise<CrimeReport[]>;
  getAllCrimeReports(): Promise<CrimeReport[]>;
  createCrimeReport(report: InsertCrimeReport): Promise<CrimeReport>;
  updateCrimeReportStatus(id: number, status: string): Promise<CrimeReport | undefined>;
  assignTeamToCrimeReport(reportId: number, teamId: number): Promise<CrimeReport | undefined>;
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeamStatus(id: number, status: string): Promise<Team | undefined>;
  
  // Emergency signal operations
  getEmergencySignal(id: number): Promise<EmergencySignal | undefined>;
  getActiveEmergencySignals(): Promise<EmergencySignal[]>;
  createEmergencySignal(signal: InsertEmergencySignal): Promise<EmergencySignal>;
  resolveEmergencySignal(id: number): Promise<EmergencySignal | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private crimeReports: Map<number, CrimeReport>;
  private teams: Map<number, Team>;
  private emergencySignals: Map<number, EmergencySignal>;
  
  private userId: number;
  private reportId: number;
  private teamId: number;
  private signalId: number;

  constructor() {
    this.users = new Map();
    this.crimeReports = new Map();
    this.teams = new Map();
    this.emergencySignals = new Map();
    
    this.userId = 1;
    this.reportId = 1;
    this.teamId = 1;
    this.signalId = 1;
    
    // Add initial data for demo purposes
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  // Crime report operations
  async getCrimeReport(id: number): Promise<CrimeReport | undefined> {
    return this.crimeReports.get(id);
  }

  async getCrimeReportsByUser(userId: number): Promise<CrimeReport[]> {
    return Array.from(this.crimeReports.values()).filter(
      (report) => report.userId === userId
    );
  }

  async getAllCrimeReports(): Promise<CrimeReport[]> {
    return Array.from(this.crimeReports.values());
  }

  async createCrimeReport(insertReport: InsertCrimeReport): Promise<CrimeReport> {
    const id = this.reportId++;
    const now = new Date();
    const report: CrimeReport = {
      ...insertReport,
      id,
      assignedTeam: null,
      createdAt: now,
      updatedAt: now
    };
    this.crimeReports.set(id, report);
    return report;
  }

  async updateCrimeReportStatus(id: number, status: string): Promise<CrimeReport | undefined> {
    const report = this.crimeReports.get(id);
    if (!report) return undefined;
    
    const updatedReport = {
      ...report,
      status,
      updatedAt: new Date()
    };
    this.crimeReports.set(id, updatedReport);
    return updatedReport;
  }

  async assignTeamToCrimeReport(reportId: number, teamId: number): Promise<CrimeReport | undefined> {
    const report = this.crimeReports.get(reportId);
    if (!report) return undefined;
    
    const updatedReport = {
      ...report,
      assignedTeam: teamId,
      status: "in_progress",
      updatedAt: new Date()
    };
    this.crimeReports.set(reportId, updatedReport);
    
    // Update team status
    const team = this.teams.get(teamId);
    if (team) {
      const updatedTeam = {
        ...team,
        status: "assigned"
      };
      this.teams.set(teamId, updatedTeam);
    }
    
    return updatedReport;
  }

  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getAllTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.teamId++;
    const now = new Date();
    const team: Team = {
      ...insertTeam,
      id,
      createdAt: now
    };
    this.teams.set(id, team);
    return team;
  }

  async updateTeamStatus(id: number, status: string): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;
    
    const updatedTeam = {
      ...team,
      status
    };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  // Emergency signal operations
  async getEmergencySignal(id: number): Promise<EmergencySignal | undefined> {
    return this.emergencySignals.get(id);
  }

  async getActiveEmergencySignals(): Promise<EmergencySignal[]> {
    return Array.from(this.emergencySignals.values()).filter(
      (signal) => signal.active
    );
  }

  async createEmergencySignal(insertSignal: InsertEmergencySignal): Promise<EmergencySignal> {
    const id = this.signalId++;
    const now = new Date();
    const signal: EmergencySignal = {
      ...insertSignal,
      id,
      createdAt: now,
      resolvedAt: null
    };
    this.emergencySignals.set(id, signal);
    return signal;
  }

  async resolveEmergencySignal(id: number): Promise<EmergencySignal | undefined> {
    const signal = this.emergencySignals.get(id);
    if (!signal) return undefined;
    
    const updatedSignal = {
      ...signal,
      active: false,
      resolvedAt: new Date()
    };
    this.emergencySignals.set(id, updatedSignal);
    return updatedSignal;
  }

  // Seed initial data
  private seedData() {
    // Add demo users
    this.createUser({
      username: "civilian1",
      password: "password123",
      fullName: "Sarah Johnson",
      role: "civilian"
    });
    
    this.createUser({
      username: "police1",
      password: "password123",
      fullName: "Officer Johnson",
      role: "police"
    });

    // Add demo teams
    this.createTeam({
      name: "Team Alpha",
      type: "Patrol Unit",
      members: [{ id: 2, name: "Officer Johnson" }],
      status: "available"
    });
    
    this.createTeam({
      name: "Team Bravo",
      type: "Investigation Unit",
      members: [{ id: 2, name: "Officer Johnson" }],
      status: "available"
    });

    // Add demo crime reports
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    this.createCrimeReport({
      userId: 1,
      crimeType: "Vehicle Break-in",
      description: "Car window smashed, items stolen from vehicle on Oak Street.",
      location: "Downtown",
      latitude: "40.7128",
      longitude: "-74.0060",
      date: twoWeeksAgo,
      status: "resolved",
      evidence: []
    });
    
    this.createCrimeReport({
      userId: 1,
      crimeType: "Suspicious Activity",
      description: "Unknown persons loitering near the community center at night.",
      location: "Westside",
      latitude: "40.7129",
      longitude: "-74.0061",
      date: oneWeekAgo,
      status: "resolved",
      evidence: []
    });
    
    this.createCrimeReport({
      userId: 1,
      crimeType: "Attempted Break-in",
      description: "Signs of forced entry attempt at backdoor of residence.",
      location: "North Hills",
      latitude: "40.7130",
      longitude: "-74.0062",
      date: threeDaysAgo,
      status: "in_progress",
      evidence: []
    });
  }
}

export const storage = new MemStorage();
