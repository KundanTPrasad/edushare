export interface PredictionTopic {
  topic: string;
  count: number;
}

export interface RepeatedQuestion {
  question: string;
  years: number[];
  confidence: "medium" | "high" | "very-high";
}

export interface Prediction {
  highProbabilityTopics: PredictionTopic[];
  mediumProbabilityTopics: PredictionTopic[];
  repeatedQuestions: RepeatedQuestion[];
  confidence?: "none" | "very-low" | "low" | "medium" | "high";
  paperCount?: number;
  analyzedPapers?: number;
  message?: string;
  remaining?: number;
  fileUrls?: string[];
}
