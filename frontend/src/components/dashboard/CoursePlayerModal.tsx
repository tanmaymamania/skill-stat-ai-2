import { useState, useMemo } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Play,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  Tv,
  Video,
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

const TOPIC_VIDEO_SOURCES: Record<string, { mp4: string; youtubeId: string; title: string }> = {
  default: {
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    youtubeId: "sZkMvdcglrA",
    title: "Official Cadre Statistics & Empirical Survey Methods",
  },
  sampling: {
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    youtubeId: "sZkMvdcglrA",
    title: "Survey Sampling, Multi-Stage Stratification & NSS Design",
  },
  python: {
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    youtubeId: "rfscVS0vtbw",
    title: "Python Data Analysis, Pandas & Automated Government Microdata Pipelines",
  },
  gis: {
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    youtubeId: "2XnL-jA6m70",
    title: "QGIS Geospatial Mapping, Cadastral Buffers & Spatial Statistics",
  },
  accounts: {
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    youtubeId: "14ePj_X5JpA",
    title: "National Accounts Compilation, GSDP Deflators & Economic Indicators",
  },
  sql: {
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    youtubeId: "HXV3zeRR3h4",
    title: "Advanced SQL Aggregations & Public Administrative Registries",
  },
  quality: {
    mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    youtubeId: "7DkeZ_6oXp0",
    title: "UN NQAF Data Quality, Imputation & Administrative Validation",
  },
};

function getCourseVideo(title: string, category?: string) {
  const combined = (title + " " + (category || "")).toLowerCase();
  if (combined.includes("python") || combined.includes("scripting") || combined.includes("machine learning")) return TOPIC_VIDEO_SOURCES.python;
  if (combined.includes("gis") || combined.includes("spatial") || combined.includes("mapping")) return TOPIC_VIDEO_SOURCES.gis;
  if (combined.includes("sql") || combined.includes("database") || combined.includes("registry")) return TOPIC_VIDEO_SOURCES.sql;
  if (combined.includes("account") || combined.includes("gsdp") || combined.includes("cpi") || combined.includes("macroeconomic")) return TOPIC_VIDEO_SOURCES.accounts;
  if (combined.includes("quality") || combined.includes("imputation") || combined.includes("assurance")) return TOPIC_VIDEO_SOURCES.quality;
  if (combined.includes("survey") || combined.includes("sampling") || combined.includes("plfs") || combined.includes("nss")) return TOPIC_VIDEO_SOURCES.sampling;
  return TOPIC_VIDEO_SOURCES.default;
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
  const [playerMode, setPlayerMode] = useState<"native" | "embed">("native");

  // Dynamic AI Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Generate dynamic AI questions specifically for this course
  const dynamicQuizQuestions = useMemo<QuizQuestion[]>(() => {
    return generateDynamicCourseQuiz(course.title, course.category, 5);
  }, [course.title, course.category]);

  const videoData = useMemo(() => {
    return getCourseVideo(course.title, course.category);
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

  // Flatten lessons for seamless video navigation
  const allLessons = useMemo(() => {
    const list: {
      index: number;
      moduleIdx: number;
      lessonIdx: number;
      moduleTitle: string;
      title: string;
      summary: string;
      content: string;
    }[] = [];
    let idx = 0;
    modules.forEach((m, mIdx) => {
      m.lessons.forEach((l, lIdx) => {
        list.push({
          index: idx++,
          moduleIdx: mIdx,
          lessonIdx: lIdx,
          moduleTitle: m.title,
          title: l.title,
          summary: l.summary,
          content: l.content,
        });
      });
    });
    return list;
  }, []);

  const currentLesson = allLessons[selectedLesson] || allLessons[0];
  const currentLessonKey = `${currentLesson.moduleIdx}-${currentLesson.lessonIdx}`;
  const isCurrentLessonDone = !!completedLessons[currentLessonKey];

  const totalLessons = allLessons.length;
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const syncCourseProgress = (updatedCompleted: Record<string, boolean>) => {
    try {
      const raw = localStorage.getItem("active_learning_paths");
      if (raw) {
        const paths = JSON.parse(raw);
        if (Array.isArray(paths)) {
          const count = Object.values(updatedCompleted).filter(Boolean).length;
          const pct = Math.round((count / totalLessons) * 100);
          const updated = paths.map((p) => {
            if (p.id === course.id || p.title === course.title) {
              return {
                ...p,
                status: pct >= 100 ? "Completed" : pct > 0 ? "In Progress" : p.status,
                progress: pct,
              };
            }
            return p;
          });
          localStorage.setItem("active_learning_paths", JSON.stringify(updated));
          if (onCourseUpdated) onCourseUpdated();
        }
      }
    } catch {}
  };

  const toggleLesson = (key: string) => {
    setCompletedLessons((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };
      syncCourseProgress(next);
      return next;
    });
  };

  const markCurrentLessonComplete = () => {
    if (!isCurrentLessonDone) {
      toggleLesson(currentLessonKey);
    }
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
        }
      }

      // Mark all lessons as completed
      const allDone: Record<string, boolean> = {};
      allLessons.forEach((l) => {
        allDone[`${l.moduleIdx}-${l.lessonIdx}`] = true;
      });
      setCompletedLessons(allDone);

      // Record to user assessment history
      syncActiveUserAssessmentHistory({
        quizTitle: `${course.title} Mastery Quiz`,
        scorePercent: 100,
        competenciesGained: course.skills || ["Applied Cadre Competency"],
      });

      if (onCourseUpdated) onCourseUpdated();
    } catch (e) {
      console.warn("Could not mark course as complete:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold shadow">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
                  {course.provider || "MoSPI Cadre Academy"}
                </span>
                {course.priority && (
                  <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                    {course.priority} Priority
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-foreground line-clamp-1">{course.title}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-border px-6 bg-card">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("syllabus")}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
                activeTab === "syllabus"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" /> Curriculum & Syllabus
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("material")}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
                activeTab === "material"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlayCircle className="h-4 w-4" /> Course Video & Study Guide
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
                activeTab === "quiz"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4 text-accent" /> AI Mastery Quiz
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{course.duration || "2 hrs 30 mins"}</span>
            </div>
            <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground">{progressPercent}%</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: SYLLABUS */}
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
                        const lessonFlatIdx = mIdx * 2 + lIdx;
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
                                setSelectedLesson(lessonFlatIdx);
                                setActiveTab("material");
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline shrink-0"
                            >
                              Watch Video & Notes <ChevronRight className="h-3 w-3" />
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

          {/* TAB 2: FUNCTIONAL VIDEO PLAYER & STUDY GUIDE */}
          {activeTab === "material" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                {/* Header with Lesson Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                      {currentLesson.moduleTitle} · Lesson {selectedLesson + 1} of {allLessons.length}
                    </span>
                    <h3 className="mt-0.5 text-lg font-bold text-foreground">
                      {currentLesson.title}
                    </h3>
                  </div>

                  {/* Player Mode Switcher */}
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPlayerMode("native")}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition ${
                        playerMode === "native"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Video className="h-3.5 w-3.5" /> High-Def Stream
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerMode("embed")}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition ${
                        playerMode === "embed"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Tv className="h-3.5 w-3.5" /> iGOT / NPTEL Embed
                    </button>
                  </div>
                </div>

                {/* Real Working Video Player Container */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border shadow-md">
                  {playerMode === "native" ? (
                    <video
                      key={videoData.mp4 + "-" + selectedLesson}
                      src={videoData.mp4}
                      controls
                      autoPlay
                      playsInline
                      className="h-full w-full object-contain"
                    >
                      Your browser does not support HTML5 video streaming.
                    </video>
                  ) : (
                    <iframe
                      key={videoData.youtubeId + "-" + selectedLesson}
                      src={`https://www.youtube-nocookie.com/embed/${videoData.youtubeId}?autoplay=1&rel=0`}
                      title={videoData.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  )}
                </div>

                {/* Video Action Toolbar & Lesson Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markCurrentLessonComplete}
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                        isCurrentLessonDone
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-success text-success-foreground hover:bg-success/90"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isCurrentLessonDone ? "Lesson Marked Completed" : "Mark Lesson Completed"}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Progress: <span className="font-bold text-foreground">{progressPercent}%</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={selectedLesson === 0}
                      onClick={() => setSelectedLesson((prev) => Math.max(0, prev - 1))}
                      className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {selectedLesson + 1} / {allLessons.length}
                    </span>
                    <button
                      type="button"
                      disabled={selectedLesson === allLessons.length - 1}
                      onClick={() => setSelectedLesson((prev) => Math.min(allLessons.length - 1, prev + 1))}
                      className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Lesson Playlist Pills */}
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Lecture Series Playlist (Click to Play):
                  </p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {allLessons.map((l) => {
                      const lKey = `${l.moduleIdx}-${l.lessonIdx}`;
                      const isDone = !!completedLessons[lKey];
                      const isSelected = selectedLesson === l.index;
                      return (
                        <button
                          key={l.index}
                          type="button"
                          onClick={() => setSelectedLesson(l.index)}
                          className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition ${
                            isSelected
                              ? "border-accent bg-accent/10 font-bold text-foreground"
                              : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold">
                              {l.index + 1}
                            </span>
                            <span className="truncate text-foreground font-medium">{l.title}</span>
                          </div>
                          {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Technical Notes Content for Active Lesson */}
                <div className="mt-4 space-y-4 text-xs text-foreground leading-relaxed">
                  <h4 className="text-sm font-bold border-b border-border pb-2">
                    Official Cadre Lecture Notes: {currentLesson.title}
                  </h4>
                  <p>{currentLesson.content}</p>

                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <p className="font-bold text-foreground">Standard Cadre Operational Checklist:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                      <li>Follow MoSPI standardized multi-stage stratification protocols.</li>
                      <li>Cross-validate high-frequency anomalies against administrative tax & GST registries.</li>
                      <li>Ensure strict compliance with the Digital Personal Data Protection (DPDP) Act 2023.</li>
                      <li>Maintain verifiable imputation logs for institutional accountability.</li>
                    </ul>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center border-t border-border pt-4">
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
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Test Understanding with AI Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC AI QUIZ */}
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
                    <span className="text-xs text-muted-foreground font-semibold">
                      Answered: {Object.keys(quizAnswers).length} / {dynamicQuizQuestions.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {dynamicQuizQuestions.map((q, idx) => (
                      <div key={q.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-xs font-bold text-foreground">
                            Question {idx + 1}: {q.prompt}
                          </h4>
                          <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent shrink-0">
                            {q.competency}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[q.id] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleQuizAnswer(q.id, optIdx)}
                                className={`w-full text-left rounded-lg border p-3 text-xs transition flex items-center justify-between ${
                                  isSelected
                                    ? "border-accent bg-accent/10 text-foreground font-semibold"
                                    : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && (
                                  <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setQuizStarted(false)}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={Object.keys(quizAnswers).length < dynamicQuizQuestions.length}
                      onClick={() => setQuizSubmitted(true)}
                      className="rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
                    >
                      Submit Answers & Evaluate
                    </button>
                  </div>
                </div>
              ) : (
                /* QUIZ RESULT */
                <div className="rounded-xl border border-border bg-card p-8 text-center space-y-5 shadow-sm">
                  {calculateQuizScore() >= 60 ? (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                      <Award className="h-9 w-9" />
                    </div>
                  ) : (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                      <RotateCcw className="h-8 w-8" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">
                      {calculateQuizScore() >= 60 ? "Cadre Competency Mastered!" : "Review Required"}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your Score: <span className="font-bold text-foreground text-sm">{calculateQuizScore()}%</span> ({calculateQuizScore() >= 60 ? "Passed - Benchmark Achieved" : "Passing benchmark is 60%"})
                    </p>
                  </div>

                  {calculateQuizScore() >= 60 ? (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-xs text-success space-y-1">
                        <p className="font-bold">✓ Official Competency Gap Reduced</p>
                        <p className="text-[11px] text-muted-foreground">
                          Your true skill level for <span className="font-semibold text-foreground">{course.title}</span> has been leveled up in your cadre records.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleCompleteCourse();
                          onClose();
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-success px-6 py-2.5 text-xs font-bold text-success-foreground hover:bg-success/90 shadow transition"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Save Result & Mark Course Completed
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                        Review the lessons in the syllabus and retake the AI quiz when ready.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQuizStarted(true);
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition shadow"
                      >
                        <RotateCcw className="h-4 w-4" /> Retake AI Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
