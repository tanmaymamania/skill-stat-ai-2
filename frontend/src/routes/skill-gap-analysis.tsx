import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { AlertTriangle, Check, Sparkles, Target, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { getSkillGapRows, type SkillGapRow } from "@/lib/learner-data";

export const Route = createFileRoute("/skill-gap-analysis")({
  component: SkillGapAnalysisPage,
});

type Filter = "all" | "priority" | "Technical" | "Statistical" | "Governance";

function SkillGapAnalysisPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  
  // [FIXED]: Read dynamically so changes from quiz completion appear immediately
  const [gapRows, setGapRows] = useState<SkillGapRow[]>([]);

  useEffect(() => {
    setGapRows(getSkillGapRows());
  }, []);

  const filteredRows = useMemo(() => {
    if (activeFilter === "all") return gapRows;
    if (activeFilter === "priority") {
      return gapRows.filter((r) => r.gap < 0);
    }
    return gapRows.filter((r) => r.category === activeFilter);
  }, [activeFilter, gapRows]);

  const priorityGapCount = gapRows.filter((r) => r.gap < 0).length;

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DashboardSidebar className="sticky top-0 hidden h-screen lg:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar onMenuClick={() => undefined} />

        <main className="flex-1 px-4 py-6 lg:px-7 lg:py-7">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Competency Skill Gap Analysis</h1>
                <p className="text-xs text-muted-foreground">
                  Benchmark: Statistical Officer Cadre Requirements vs Verified Assessment
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent">
                <Target className="h-4 w-4" />
                {priorityGapCount} Active Competency Gaps
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-border pb-2">
              {(["all", "priority", "Statistical", "Technical", "Governance"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    activeFilter === tab
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tab === "priority" ? "Action Needed" : tab}
                </button>
              ))}
            </div>

            {/* Skill Gap Table / Empty State */}
            {filteredRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Target className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <h3 className="mt-3 text-base font-bold text-foreground">
                  {gapRows.length === 0
                    ? "No Skill Gaps Identified Yet"
                    : "No skill gaps in this category"}
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                  {gapRows.length === 0
                    ? "Your competency levels and skill gaps are established through the AI Diagnostic Assessment Quiz. Take the quiz to compare your skills against cadre benchmarks."
                    : "Try selecting another filter above to view other competencies."}
                </p>
                {gapRows.length === 0 && (
                  <Link
                    to="/ai-assessment-quiz"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground transition hover:bg-accent/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    Start Assessment Quiz
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-3.5">Competency Skill</th>
                      <th className="p-3.5">Domain</th>
                      <th className="p-3.5 text-center">Verified Level</th>
                      <th className="p-3.5 text-center">Target Level</th>
                      <th className="p-3.5 text-center">Current Gap</th>
                      <th className="p-3.5 text-center">Action Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {filteredRows.map((row) => (
                      <tr key={row.skill} className="hover:bg-muted/20">
                        <td className="p-3.5">
                          <p className="font-bold text-foreground">{row.skill}</p>
                          <p className="text-[11px] text-muted-foreground">{row.description}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold">
                            {row.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold">Level {row.currentLevel}</td>
                        <td className="p-3.5 text-center font-bold">Level {row.requiredLevel}</td>
                        <td className="p-3.5 text-center">
                          {row.gap < 0 ? (
                            <span className="font-bold text-destructive">{row.gap} Levels</span>
                          ) : (
                            <span className="font-bold text-success">✓ Benchmark Met</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {row.gap < 0 ? (
                            <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive">
                              High Priority
                            </span>
                          ) : (
                            <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold text-success">
                              Meets Requirement
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
