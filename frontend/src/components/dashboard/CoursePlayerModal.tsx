import { useState, useMemo } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { generateDynamicCourseQuiz, type QuizQuestion } from "@/lib/quiz-data";
import { syncActiveUserAssessmentHistory } from "@/lib/auth-service";

export type CourseDetails = {
  id: number | string;
  title: string;
  provider: string;
  description: string;
  duration?: string;
  category?: string;
  skills?: string[];
  whyRecommended?: string;
  progress?: number;
  priority?: string;
};

interface CoursePlayerModalProps {
  course: CourseDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onCourseUpdated?: () => void;
}

export function CoursePlayerModal({
  course,
  isOpen,
  onClose,
  onCourseUpdated,
}: CoursePlayerModalProps) {
  if (!isOpen || !course) return null;

  const [activeTab, setActiveTab] = useState<"syllabus" | "material" | "quiz">("syllabus");
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<number>(0);

  // Dynamic AI Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Generate dynamic AI questions specifically for this course
  const dynamicQuizQuestions = useMemo<QuizQuestion[]>(() => {
    return generateDynamicCourseQuiz(course.title, course.category, 5);
  }, [course.title, course.category]);

  // Structured syllabus modules
  const modules = [
    {
      title: "Module 1: Framework & Principles",
      duration: "45 mins",
      lessons: [
        {
          title: "Introduction to Official Cadre Standards",
          summary: "Core concepts, institutional mandate, and alignment with national statistical policy.",
          content: `In this introductory section, learners explore the statutory and operational foundations governing ${course.title}. Understanding national statistical mandates, standardized classifications, and inter-departmental data flows ensures consistent administrative reporting across states and central ministries.`,
        },
        {
          title: "Methodological Foundations & Definitions",
          summary: "Standard definitions, survey instruments, and conceptual frameworks.",
          content: `Accurate statistical compilation begins with rigorous definitions. This lesson covers standard terminology, international benchmarks (UNSD, ILO, IMF GDDS), and specific MoSPI operational guidelines for executing surveys and administrative data integration.`,
        },
      ],
    },
    {
      title: "Module 2: Practical Techniques & Tools",
      duration: "1 hr 15 mins",
      lessons: [
        {
          title: "Data Processing, Validation & Imputation",
          summary: "Handling outliers, missing responses, and consistency checks in real datasets.",
          content: `Field survey datasets inevitably encounter non-response and transcription anomalies. Learn modern imputation methodologies (hot-deck, demographic donor matching) and multi-level consistency checks to guarantee empirical integrity prior to tabulation.`,
        },
        {
          title: "Computational Analysis & Workflow Automation",
          summary: "Scripting analytical pipelines and generating automated tabular summaries.",
          content: `Transition away from manual spreadsheets to reproducible code-based pipelines using Python (Pandas/NumPy) and SQL. Automate district-level aggregations, calculate sampling weights, and produce audit trails for official dissemination.`,
        },
      ],
    },
    {
      title: "Module 3: Cadre Case Studies & Public Policy",
      duration: "1 hr",
      lessons: [
        {
          title: "National Economic & Social Indicators",
          summary: "Compilation of GSDP, CPI baskets, PLFS metrics, and SDG district dashboards.",
          content: `Examine real-world government case studies where accurate statistical indicators directly influenced public resource allocation. Study disaggregated state accounts, seasonal price adjustments, and high-frequency administrative tax linkages.`,
        },
        {
          title: "Data Governance & Confidentiality Protocols",
          summary: "Complying with the DPDP Act 2023, data masking, and secure microdata sharing.",
          content: `Ensuring privacy and respondent confidentiality is a non-negotiable legal obligation. Master anonymization techniques, PII cryptographic hashing, and tiered access protocols for public policy researchers.`,
        },
      ],
    },
  ];

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const toggleLesson = (key: string) => {
    setCompletedLessons((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleQuizAnswer = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    dynamicQuizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / dynamicQuizQuestions.length) * 100);
  };

  const handleCompleteCourse = () => {
    try {
      const raw = localStorage.getItem("active_learning_paths");
      if (raw) {
        const paths = JSON.parse(raw);
        if (Array.isArray(paths)) {
          const updated = paths.map((p) => {
            if (p.id === course.id || p.title === course.title) {
              return {
                ...p,
                status: "Completed",
                progress: 100,
              };
            }
            return p;
          });
          localStorage.setItem("active_learning_paths", JSON.stringify(updated));
          syncActiveUserAssessmentHistory();
        }
      }
      if (onCourseUpdated) onCourseUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Course Player Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                  {course.provider || "iGOT Karmayogi Official"}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Clock3 className="h-3 w-3" /> {course.duration || "4 hours"}
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground sm:text-lg leading-tight mt-0.5">
                {course.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Completion Button */}
            <button
              type="button"
              onClick={handleCompleteCourse}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-success/15 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/25 transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Course Done
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-6 py-2">
          <button
            type="button"
            onClick={() => setActiveTab("syllabus")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "syllabus"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Course Syllabus & Lessons
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("material")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "material"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Interactive Study Reader
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "quiz"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Generate AI Practice Quiz
          </button>

          <div className="ml-auto hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progress:</span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground">{progressPercent}%</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "syllabus" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                <h3 className="text-sm font-bold text-foreground">Course Overview</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
                {course.whyRecommended && (
                  <div className="mt-3 rounded-lg bg-accent/10 border border-accent/20 p-3 text-xs text-accent">
                    <span className="font-bold">Why AI Recommended: </span>
                    {course.whyRecommended}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Curriculum Modules</h3>
                {modules.map((m, mIdx) => (
                  <div key={mIdx} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {m.title}
                      </h4>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {m.duration}
                      </span>
                    </div>

                    <div className="divide-y divide-border">
                      {m.lessons.map((lesson, lIdx) => {
                        const lessonKey = `${mIdx}-${lIdx}`;
                        const isDone = !!completedLessons[lessonKey];
                        return (
                          <div
                            key={lIdx}
                            className="flex items-start justify-between py-3 gap-3 hover:bg-muted/20 px-2 rounded-lg transition"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleLesson(lessonKey)}
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                                  isDone
                                    ? "border-success bg-success text-success-foreground"
                                    : "border-border bg-background text-transparent hover:border-accent"
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <div>
                                <h5 className="text-xs font-semibold text-foreground">
                                  {lesson.title}
                                </h5>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {lesson.summary}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLesson(mIdx * 2 + lIdx);
                                setActiveTab("material");
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline shrink-0"
                            >
                              Read Lesson <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "material" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-accent">
                  <PlayCircle className="h-4 w-4" />
                  <span>Cadre Interactive Learning Material</span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-foreground">
                  {course.title}: Core Cadre Competency Guide
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Compiled for National & State Statistical Cadres under Ministry of Statistics & Programme Implementation guidelines.
                </p>

                {/* Video Lesson Player Mockup */}
                <div className="mt-4 aspect-video w-full rounded-xl bg-zinc-950 flex flex-col items-center justify-center text-zinc-300 relative overflow-hidden group border border-zinc-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/90 text-white shadow-lg transition transform group-hover:scale-110">
                      <PlayCircle className="h-8 w-8 ml-0.5" />
                    </div>
                    <p className="text-xs font-semibold text-white tracking-wide">
                      Interactive Audio/Video Lecture: {course.title}
                    </p>
                    <span className="text-[10px] text-zinc-400">
                      High-Definition Cadre Lecture Series (iGOT Integrated)
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-xs text-foreground leading-relaxed">
                  <h4 className="text-sm font-bold border-b border-border pb-2">
                    Comprehensive Technical Notes
                  </h4>
                  <p>
                    The modern statistical framework requires continuous alignment with empirical accuracy and open-source data manipulation workflows. Under Indian cadre guidelines, officers must combine statistical inference with automated validation rules.
                  </p>
                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <p className="font-bold text-foreground">Key Cadre Competency Rules:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                      <li>Always verify sampling weights prior to generating regional aggregates.</li>
                      <li>Document every imputation transformation for complete auditability.</li>
                      <li>Protect personally identifiable information (PII) under the DPDP Act 2023.</li>
                      <li>Cross-validate survey aggregates against administrative data registries.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("syllabus")}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Syllabus
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("quiz")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Test Understanding with AI Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="max-w-2xl mx-auto space-y-6">
              {!quizStarted ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4 shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      On-Demand AI Mastery Quiz
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                      Generate dynamic assessment questions tailored to <span className="font-semibold text-foreground">{course.title}</span>. You can test your mastery directly on the platform without visiting external sites.
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground text-left max-w-sm mx-auto space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Questions:</span>
                      <span className="font-bold text-foreground">{dynamicQuizQuestions.length} Questions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pass Criteria:</span>
                      <span className="font-bold text-foreground">60% Mastery</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Outcome:</span>
                      <span className="font-bold text-success">Levels up your Competency Gap</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizStarted(true);
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 shadow transition"
                  >
                    <Sparkles className="h-4 w-4" /> Launch AI Generated Quiz
                  </button>
                </div>
              ) : !quizSubmitted ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-accent">
                      <Sparkles className="h-4 w-4" />
                      <span>In-Platform AI Mastery Test: {course.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(quizAnswers).length} of {dynamicQuizQuestions.length} answered
                    </span>
                  </div>

                  {dynamicQuizQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-semibold text-foreground leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      <div className="space-y-2 pl-7">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[q.id] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleQuizAnswer(q.id, optIdx)}
                              className={`flex w-full items-center text-left rounded-lg border p-2.5 text-xs transition ${
                                isSelected
                                  ? "border-accent bg-accent/10 font-semibold text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/40"
                              }`}
                            >
                              <span
                                className={`mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                                  isSelected
                                    ? "border-accent bg-accent text-accent-foreground font-bold"
                                    : "border-border"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setQuizStarted(false)}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuizSubmitted(true);
                        const score = calculateQuizScore();
                        if (score >= 60) {
                          handleCompleteCourse();
                        }
                      }}
                      disabled={Object.keys(quizAnswers).length < dynamicQuizQuestions.length}
                      className="rounded-lg bg-primary px-6 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
                    >
                      Submit AI Quiz & Evaluate
                    </button>
                  </div>
                </div>
              ) : (
                /* Quiz Results */
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div className="text-center space-y-2">
                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                        calculateQuizScore() >= 60
                          ? "bg-success/15 text-success"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      <Award className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {calculateQuizScore() >= 60 ? "Course Mastery Demonstrated!" : "Needs Review"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      You scored <span className="font-bold text-foreground">{calculateQuizScore()}%</span> on the dynamic assessment for {course.title}.
                    </p>
                    {calculateQuizScore() >= 60 && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success mt-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Course Marked Completed & Skill Upgraded!
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border-t border-border pt-4">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Question Review & Explanations
                    </h4>
                    {dynamicQuizQuestions.map((q, idx) => {
                      const userAns = quizAnswers[q.id];
                      const isCorrect = userAns === q.correctAnswer;
                      return (
                        <div key={q.id} className="rounded-lg border border-border p-3 space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                isCorrect ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <p className="font-semibold text-foreground">{q.question}</p>
                          </div>
                          <div className="pl-6 space-y-1 text-[11px]">
                            <p className="text-muted-foreground">
                              Your answer: <span className="font-medium text-foreground">{q.options[userAns]}</span>
                            </p>
                            {!isCorrect && (
                              <p className="text-success font-medium">
                                Correct answer: {q.options[q.correctAnswer]}
                              </p>
                            )}
                            <p className="text-muted-foreground bg-muted/50 p-2 rounded text-[11px] mt-1">
                              <span className="font-semibold text-foreground">Explanation: </span>
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="h-3 w-3" /> Retake Quiz
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
