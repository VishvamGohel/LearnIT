export type AppStatus = 'idle' | 'assessing' | 'generating' | 'learning';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'unlocked' | 'completed' | 'in-progress';
  order: number;
  learningMaterial?: string; // Markdown content — generated lazily on node click
  isLoadingLesson?: boolean; // True while Gemini is generating the lesson
  quiz?: QuizQuestion[];
  hasFailedQuiz?: boolean; // True if the user failed the quiz and needs AI pass
  failedQuestions?: QuizQuestion[]; // The specific questions the user failed
  checkpointQuestion: string;
  checkpointOptions?: string[]; // Multiple choice fallback
  checkpointAnswer: string;
}

export interface Roadmap {
  id: string;
  topic: string;
  nodes: RoadmapNode[];
  activeNodeId: string;
  progressPercentage: number;
  createdAt: number;
  userLevel?: string;  // e.g. "complete beginner"
  userGoal?: string;   // e.g. "practical application"
  userPace?: string;   // e.g. "quick crash course"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}
