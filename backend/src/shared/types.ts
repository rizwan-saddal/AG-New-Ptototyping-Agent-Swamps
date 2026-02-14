// Core type definitions for the Agent Swamps system

export enum AgentType {
  DEVELOPER = 'DEVELOPER',
  QA = 'QA',
  DEVOPS = 'DEVOPS',
  PRODUCT_MANAGER = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
  MARKETING = 'MARKETING',
  TECH_WRITER = 'TECH_WRITER',
  RESEARCH = 'RESEARCH',
  SEO = 'SEO',
  LEAD_GENERATION = 'LEAD_GENERATION',
  AI_ML = 'AI_ML',
  MENTOR = 'MENTOR'
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
  SEO_OPTIMIZATION = 'SEO_OPTIMIZATION',
  LEAD_GENERATION = 'LEAD_GENERATION',
  CONTENT_MARKETING = 'CONTENT_MARKETING',
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

// Agent Management System Types

export interface AgentTrainingData {
  taskId: string;
  input: string;
  output: string;
  success: boolean;
  feedback?: string;
  timestamp: Date;
}

export interface AgentLearningProfile {
  agentId: string;
  trainingHistory: AgentTrainingData[];
  strengthAreas: string[];
  improvementAreas: string[];
  preferredTaskTypes: TaskType[];
  learningRate: number;
  lastTrainingDate: Date;
  learningStrategy?: 'supervised' | 'reinforced' | 'continuous';
}

export interface AgentTemplate {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  defaultCapabilities: string[];
  defaultSpecializations: string[];
  promptTemplate: string;
  trainingStrategy?: 'supervised' | 'reinforced' | 'continuous';
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  requiredAgentTypes: AgentType[];
  estimatedDuration?: number;
  category: 'development' | 'marketing' | 'operations' | 'custom';
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentType: AgentType;
  taskType: TaskType;
  dependencies: string[];
  inputs: Record<string, any>;
  expectedOutputs: string[];
}

export interface WorkflowExecution {
  id: string;
  templateId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: number;
  steps: WorkflowStepExecution[];
  startedAt: Date;
  completedAt?: Date;
  results: Record<string, any>;
}

export interface WorkflowStepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  assignedAgentId?: string;
  taskId?: string;
  result?: any;
  error?: string;
}

export type RewardStrategy = 'success_rate' | 'feedback_bonus';

export interface RewardConfig {
  strategy: RewardStrategy;
  successWeight?: number;
  feedbackWeight?: number;
}

export interface ReinforcementTrainingConfig {
  agentId: string;
  modelProvider: string;
  trainingDataset: AgentTrainingData[];
  rewardConfig: RewardConfig;
  epochs: number;
  learningRate: number;
  batchSize: number;
}

export interface AgentCreationRequest {
  name: string;
  type: AgentType;
  templateId?: string;
  customCapabilities?: string[];
  customSpecializations?: string[];
  trainingStrategy?: 'supervised' | 'reinforced' | 'continuous';
  initialTrainingData?: AgentTrainingData[];
}

// Connector definitions follow open standards (OpenAPI/JSON Schema/BPMN)
export interface ConnectorDefinition {
  id: string;
  name: string;
  description: string;
  standard: 'openapi' | 'jsonschema' | 'bpmn';
  schemaRef?: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  auth: {
    type: 'none' | 'apiKey' | 'oauth2';
    description?: string;
  };
  example?: Record<string, any>;
}

export interface WorkflowCanvas {
  templateId: string;
  name: string;
  category: WorkflowTemplate['category'];
  nodes: Array<{
    id: string;
    label: string;
    agentType: AgentType;
    taskType: TaskType;
    expectedOutputs: string[];
  }>;
  edges: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
  metadata?: Record<string, any>;
}
