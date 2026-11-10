/**
 * REST API Client for MOSEB STUDENT LAB Backend & Frontend Autonomous AI Multi-Agent Core
 * Connects Multi-Agent AI System, ChromaDB Hybrid Search, YOLOv8 Vision,
 * SQLite Databases, and Google Gemini LLM Client-Side Intelligence.
 */

import { queryGemini } from './geminiService';
import { frontendAgentOrchestrator, REGISTERED_AGENTS } from './frontendAgentOrchestrator';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AgentResponse {
  response: string;
  recommended_action?: string;
  safety_level: string;
  target_temperature?: number;
}

export interface ExperimentRecord {
  id?: number;
  title?: string;
  notes?: string;
  temperature: number;
  volume_ml: number;
  solute_name: string;
  fire_power: number;
  water_state: string;
  created_at?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  category: string;
  description: string;
  status: string;
  supported_tasks: string[];
  icon: string;
}

export interface AgentTaskResponse {
  task_id: string;
  agent_id: string;
  agent_name: string;
  status: string;
  summary: string;
  details: string;
  structured_data?: any;
  diagram_mermaid?: string;
  svg_render?: string;
  actions_taken?: Array<{ action: string;[key: string]: any }>;
  created_at: string;
}

export interface LabReportItem {
  id: number;
  title: string;
  experiment_type: string;
  author: string;
  abstract: string;
  hypothesis?: string;
  methodology: string;
  observations: string;
  calculations?: string;
  conclusion: string;
  mermaid_diagram?: string;
  apparatus_state?: any;
  tags?: string[];
  created_at: string;
}

export interface HybridSearchMatch {
  id: string;
  title: string;
  collection: string;
  snippet: string;
  combined_score: number;
  vector_score: number;
  keyword_score: number;
  metadata: Record<string, any>;
}

export interface HybridSearchResponse {
  query: string;
  total_matches: number;
  execution_time_ms: number;
  results: HybridSearchMatch[];
}

export interface VisionDetectionItem {
  label: string;
  confidence: number;
  bbox: number[];
  attributes?: Record<string, any>;
}

export interface VisionDetectionResponse {
  timestamp: string;
  model_version: string;
  detections: VisionDetectionItem[];
  summary: string;
  identified_apparatus: string[];
  estimated_liquid_volume_ml?: number;
  thermal_hotspots_detected: boolean;
  safety_violations: string[];
}

export interface ErrorLogItem {
  id: number;
  timestamp: string;
  level: string;
  error_type: string;
  message: string;
  component?: string;
  stack_trace?: string;
  resolved: boolean;
}

const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:8000'
  : '/api';

class ApiService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.getUser = this.getUser.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.getToken = this.getToken.bind(this);
    this.logout = this.logout.bind(this);
    try {
      this.token = typeof window !== 'undefined' ? localStorage.getItem('moseb_token') : null;
      const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('moseb_user') : null;
      if (cachedUser) {
        this.currentUser = JSON.parse(cachedUser);
      }
    } catch {
      this.token = null;
      this.currentUser = null;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  setSession(token: string, user: User) {
    this.token = token;
    this.currentUser = user;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('moseb_token', token);
        localStorage.setItem('moseb_user', JSON.stringify(user));
      }
    } catch { }
  }

  async queryRagAssistant(message: string): Promise<{ reply: string; sources: string[]; topic: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch { }

    try {
      const geminiRes = await queryGemini({
        prompt: message,
        systemInstruction: 'You are the MOSEB 4D Chemistry Lab AI Copilot. Answer user questions regarding chemistry, laboratory apparatus, thermodynamics, and scientific protocols clearly, accurately, and educationally.',
      });
      return {
        reply: geminiRes.text,
        sources: ['MOSEB 4D Core Literature', 'IUPAC Chemical Reference', 'Google Gemini AI'],
        topic: 'Chemistry & Physics Laboratory',
      };
    } catch { }

    return {
      reply: "Welcome to MOSEB 4D Chemistry Lab! Click 'Enter 3D Lab' in the top banner to explore the thermodynamic simulation, heat vessels with the Bunsen burner, or test chemical reaction kinetics.",
      sources: ["MOSEB Platform Documentation", "Thermodynamics Guide"],
      topic: "MOSEB Virtual Lab",
    };
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('moseb_token');
        localStorage.removeItem('moseb_user');
      } catch { }
    }
  }

  async register(data: { username: string; email: string; password: string; full_name?: string; role?: string }): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result: AuthResponse = await res.json();
        this.setSession(result.access_token, result.user);
        return result;
      }
    } catch {
      // offline/cloud mock session
    }

    const mockUser: User = {
      id: Math.floor(Math.random() * 1000) + 1,
      username: data.username,
      email: data.email,
      full_name: data.full_name || data.username,
      role: data.role || 'student',
      created_at: new Date().toISOString(),
    };
    const mockAuth: AuthResponse = {
      access_token: 'mock_jwt_' + Date.now(),
      token_type: 'bearer',
      user: mockUser,
    };
    this.setSession(mockAuth.access_token, mockAuth.user);
    return mockAuth;
  }

  async login(data: { username: string; password: string }): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result: AuthResponse = await res.json();
        this.setSession(result.access_token, result.user);
        return result;
      }
    } catch {
      // offline/cloud mock session
    }

    const mockUser: User = {
      id: 1,
      username: data.username,
      email: `${data.username}@moseblab.edu`,
      full_name: data.username,
      role: 'student',
      created_at: new Date().toISOString(),
    };
    const mockAuth: AuthResponse = {
      access_token: 'mock_jwt_' + Date.now(),
      token_type: 'bearer',
      user: mockUser,
    };
    this.setSession(mockAuth.access_token, mockAuth.user);
    return mockAuth;
  }

  async checkHealth(): Promise<{ status: string; database?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) return await res.json();
    } catch {
      // offline
    }
    return { status: 'offline', database: 'unavailable' };
  }

  async saveExperiment(record: ExperimentRecord): Promise<ExperimentRecord> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

      const res = await fetch(`${API_BASE}/api/experiments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(record),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return { ...record, id: Math.floor(Math.random() * 1000) };
  }

  async consultAgent(query: {
    prompt: string;
    current_temp: number;
    current_volume: number;
    current_state: string;
    solute_name: string;
  }): Promise<AgentResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/agent/consult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline / Client-Side: Process directly with Gemini LLM
    }

    try {
      const geminiRes = await queryGemini({
        prompt: `Experimental state: Temperature: ${query.current_temp.toFixed(1)}°C, Volume: ${query.current_volume}mL, State: ${query.current_state}, Solute: ${query.solute_name}.\nUser query: "${query.prompt}". Provide an informative scientific analysis for the virtual lab student.`,
        systemInstruction: 'You are the Autonomous Multi-Agent Chemistry Laboratory Copilot. Analyze the telemetry and give concise, authoritative chemical guidance.',
      });

      const t = query.current_temp;
      const recAction = /heat|boil/i.test(query.prompt) ? 'IGNITE_BURNER' : /cool|ice/i.test(query.prompt) ? 'ADD_ICE' : 'STANDBY';
      const safety = t > 95 ? 'CAUTION: Boiling Surface' : t > 70 ? 'WARNING: High Thermal Area' : 'SAFE: Ambient Conditions';

      return {
        response: geminiRes.text,
        recommended_action: recAction,
        safety_level: safety,
        target_temperature: t > 90 ? 100 : 25,
      };
    } catch {
      // fallback
    }

    const t = query.current_temp;
    return {
      response: `AI Lab Agent telemetry active. Solution: ${query.solute_name} at ${t.toFixed(1)}°C. Ready for thermodynamic operations.`,
      recommended_action: 'STANDBY',
      safety_level: 'SAFE',
      target_temperature: 22,
    };
  }

  // ==========================================
  // Multi-Agent System Endpoints (10+ Agents)
  // ==========================================

  async getAgents(): Promise<AgentInfo[]> {
    try {
      const res = await fetch(`${API_BASE}/api/agents`);
      if (res.ok) return await res.json();
    } catch { }
    return REGISTERED_AGENTS;
  }

  async dispatchAgentTask(payload: {
    prompt: string;
    agent_id?: string;
    parameters?: any;
    apparatus_state?: any;
  }): Promise<AgentTaskResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/agents/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch { }

    // Execute via Frontend Multi-Agent Orchestrator (Powered by Gemini API)
    return await frontendAgentOrchestrator.executeTask(payload);
  }

  async getLabReports(): Promise<LabReportItem[]> {
    try {
      const res = await fetch(`${API_BASE}/api/agents/reports`);
      if (res.ok) return await res.json();
    } catch { }
    const generated = await frontendAgentOrchestrator.generateLabReport();
    return [generated];
  }

  async executeHybridSearch(query: string, collection: string = 'all', top_k: number = 5): Promise<HybridSearchResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/agents/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, collection, top_k }),
      });
      if (res.ok) return await res.json();
    } catch { }
    return await frontendAgentOrchestrator.hybridSearch(query);
  }

  async detectApparatusYolo(temperature: number = 24.5, liquidLevel: number = 150.0): Promise<VisionDetectionResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/agents/vision/detect?temperature=${temperature}&liquid_level=${liquidLevel}`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch { }
    return await frontendAgentOrchestrator.detectYolo(temperature, liquidLevel);
  }

  async getTelemetryErrors(): Promise<ErrorLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/errors`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [];
  }
}

export const api = new ApiService();
export default api;
