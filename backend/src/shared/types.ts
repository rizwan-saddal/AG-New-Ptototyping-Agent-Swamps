// Core type definitions for the Agent Swamps system

export enum AgentType {
  DEVELOPER = 'DEVELOPER',
  QA = 'QA',
  DEVOPS = 'DEVOPS',
  PRODUCT_MANAGER = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
  MARKETING = 'MARKETING',
  TECH_WRITER = 'TECH_WRITER',
  RESEARCH = 'RESEARCH'
}

export enum AgentStatus {
  INITIALIZED = 'INITIALIZED',
  IDLE = 'IDLE',
  ASSIGNED = 'ASSIGNED',
  THINKING = 'THINKING',
  EXECUTING = 'EXECUTING',
  VALIDATING = 'VALIDATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum TaskType {
  CODE_GENERATION = 'CODE_GENERATION',
  CODE_REVIEW = 'CODE_REVIEW',
  TESTING = 'TESTING',
  DEPLOYMENT = 'DEPLOYMENT',
  REQUIREMENTS_ANALYSIS = 'REQUIREMENTS_ANALYSIS',
  DESIGN = 'DESIGN',
  DOCUMENTATION = 'DOCUMENTATION',
  RESEARCH = 'RESEARCH',
  GENERAL = 'GENERAL'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum MessageType {
  REQUEST = 'REQUEST',
  RESPONSE = 'RESPONSE',
  BROADCAST = 'BROADCAST',
  NOTIFICATION = 'NOTIFICATION'
}

export interface AgentCapabilities {
  skills: string[];
  maxConcurrentTasks: number;
  specializations: string[];
  supportedTaskTypes: TaskType[];
}

export interface PerformanceMetrics {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageCompletionTime: number;
  successRate: number;
  taskTypeMetrics: Record<string, number>;
  lastUpdated: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  requiredCapabilities: string[];
  context: TaskContext;
  dependencies: string[];
  subtasks?: Task[];
  assignedAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
}

export interface TaskContext {
  projectId?: string;
  repositoryUrl?: string;
  branchName?: string;
  files?: string[];
  additionalData: Record<string, any>;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
  executionTime: number;
  agentId: string;
  completedAt: Date;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string | string[];
  type: MessageType;
  priority: TaskPriority;
  payload: {
    taskId?: string;
    data: any;
    context?: Record<string, any>;
  };
  timestamp: number;
  requiresResponse: boolean;
}

export interface ModelCapabilities {
  maxTokens: number;
  supportsStreaming: boolean;
  supportsEmbedding: boolean;
  supportedModalities: string[];
}

export interface GenerateOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  preferredProvider?: string;
  stream?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
}

export interface TaskAnalysis {
  estimatedComplexity: 'low' | 'medium' | 'high';
  requiredSteps: string[];
  potentialChallenges: string[];
  recommendedApproach: string;
  additionalInfo: Record<string, any>;
}
