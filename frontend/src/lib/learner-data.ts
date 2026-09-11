export type DashboardSummaryStat = {
  label: string;
  tag: string;
  tagTone: "success" | "neutral" | "accent";
  value: string;
  valueNote?: string;
  footnote: string;
  progress: number;
};

export type CompetencyDomain = {
  icon: "analytics" | "terminal" | "account_balance" | "people";
  title: string;
  description: string;
  score: number;
  status: string;
  tone: "success" | "destructive" | "accent";
};

export type SkillGapRow = {
  skill: string;
  category: "Technical" | "Statistical" | "Governance" | "Managerial";
  description: string;
  currentLevel: number;
  currentLabel: string;
  requiredLevel: number;
  requiredLabel: string;
  gap: number;
  priority: "High" | "Moderate" | "Low";
};

export type LearningRecommendation = {
  id: number;
  title: string;
  description: string;
  provider: string;
  category: string;
  duration: string;
  skills: string[];
  status: "Recommended" | "In Progress" | "Completed";
  progress: number;
  priority: "High" | "Medium";
  courseUrl?: string;
};

/* ---------------- [FIXED]: Clean Learning Paths (No Hardcoded 42% In Progress) ---------------- */
export const defaultLearningRecommendations: LearningRecommendation[] = [
  {
    id: 1,
    title: "Python for Official Statistics",
    description: "Build practical Python skills for statistical data processing, analysis, and automation.",
    provider: "iGOT",
    category: "Technical",
    duration: "8 hours",
    skills: ["Python", "Data Analysis", "Automation"],
    status: "Recommended",
    progress: 0,
    priority: "High",
  },
  {
    id: 2,
    title: "Data Quality and Metadata Standards",
    description: "Strengthen your understanding of data quality frameworks, metadata, and statistical standards.",
    provider: "NSSTA",
    category: "Statistical",
    duration: "6 hours",
    skills: ["Data Quality", "Metadata", "Standards"],
    status: "Recommended",
    progress: 0,
    priority: "High",
  },
  {
    id: 3,
    title: "SQL for Data Management",
    description: "Develop practical SQL capabilities for querying, transforming, and managing statistical datasets.",
    provider: "iGOT",
    category: "Technical",
    duration: "5 hours",
    skills: ["SQL", "Data Management"],
    // [FIXED]: Clean state instead of hardcoded 42% In Progress
    status: "Recommended",
    progress: 0,
    priority: "Medium",
  },
  {
    id: 4,
    title: "Effective Data Visualization",
    description: "Learn how to communicate statistical findings through clear and effective visualizations.",
    provider: "iGOT",
    category: "Technical",
    duration: "4 hours",
    skills: ["Visualization", "Communication"],
    // [FIXED]: Clean state instead of hardcoded 100% Completed
    status: "Recommended",
    progress: 0,
    priority: "Medium",
  },
];

export function getLearningRecommendations(): LearningRecommendation[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("active_learning_paths");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
  }
  return defaultLearningRecommendations;
}

export function saveLearningRecommendations(paths: LearningRecommendation[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("active_learning_paths", JSON.stringify(paths));
  }
}

/* ---------------- Dynamic Learner Skill Gaps ---------------- */
export const defaultSkillGapRows: SkillGapRow[] = [
  {
    skill: "Survey Design & Sampling",
    category: "Statistical",
    description: "Survey design, stratification and sampling estimation",
    currentLevel: 2,
    currentLabel: "Foundational",
    requiredLevel: 4,
    requiredLabel: "Advanced",
    gap: -2,
    priority: "High",
  },
  {
    skill: "Python for Statistical Computing",
    category: "Technical",
    description: "Pandas, NumPy, data processing and automation",
    currentLevel: 2,
    currentLabel: "Foundational",
    requiredLevel: 4,
    requiredLabel: "Advanced",
    gap: -2,
    priority: "High",
  },
  {
    skill: "SQL for Data Management",
    category: "Technical",
    description: "Querying, joins, aggregations, and administrative datasets",
    currentLevel: 2,
    currentLabel: "Foundational",
    requiredLevel: 4,
    requiredLabel: "Advanced",
    gap: -2,
    priority: "High",
  },
  {
    skill: "e-Governance Systems & Workflows",
    category: "Governance",
    description: "Operating DigiLocker, iGOT, and e-Office administrative platforms",
    currentLevel: 3,
    currentLabel: "Operational",
    requiredLevel: 3,
    requiredLabel: "Operational",
    gap: 0,
    priority: "Low",
  },
];

export function getSkillGapRows(): SkillGapRow[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("user_assessed_skills");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
  }
  return defaultSkillGapRows;
}

export function saveSkillGapRows(rows: SkillGapRow[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_assessed_skills", JSON.stringify(rows));
  }
}

export function getPriorityGapCount(): number {
  return getSkillGapRows().filter((r) => r.gap < 0).length;
}
