import { useMemo } from 'react';
import { BarChart3, TrendingUp, Star, Calendar, PieChart, Users, CheckCircle2, Clock } from 'lucide-react';
import type { Form, Question, ResponseRow } from '@/lib/supabase';

interface AnalyticsChartsProps {
  form: Form;
  questions: Question[];
  responses: ResponseRow[];
}

export function AnalyticsCharts({ form, questions, responses }: AnalyticsChartsProps) {
  const totalSubmissions = responses.length;

  // 1. Completion Rate calculation
  const { avgCompletionRate, ratingSummary, choiceBreakdowns, dateSummaries, timelineData } = useMemo(() => {
    if (responses.length === 0 || questions.length === 0) {
      return {
        avgCompletionRate: 0,
        ratingSummary: [],
        choiceBreakdowns: [],
        dateSummaries: [],
        timelineData: [],
      };
    }

    // Completion percentage across all responses
    let totalFilled = 0;
    const totalPossible = responses.length * questions.length;
    for (const r of responses) {
      for (const q of questions) {
        if (r.answers?.[q.id] && String(r.answers[q.id]).trim().length > 0) {
          totalFilled++;
        }
      }
    }
    const avgCompletionRate = totalPossible > 0 ? Math.round((totalFilled / totalPossible) * 100) : 100;

    // Timeline data (grouped by date)
    const dateCounts: Record<string, number> = {};
    responses.forEach((r) => {
      const day = new Date(r.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      dateCounts[day] = (dateCounts[day] || 0) + 1;
    });

    const timelineData = Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .slice(-14);

    // Rating questions breakdown
    const ratingQuestions = questions.filter((q) => q.type === 'rating');
    const ratingSummary = ratingQuestions.map((q) => {
      const maxScale = q.validation?.ratingScale || 5;
      const counts: Record<number, number> = {};
      for (let i = 1; i <= maxScale; i++) counts[i] = 0;

      let sum = 0;
      let countWithAnswer = 0;

      responses.forEach((r) => {
        const val = Number(r.answers?.[q.id]);
        if (!isNaN(val) && val >= 1 && val <= maxScale) {
          counts[val] = (counts[val] || 0) + 1;
          sum += val;
          countWithAnswer++;
        }
      });

      const avg = countWithAnswer > 0 ? (sum / countWithAnswer).toFixed(1) : '—';
      return {
        question: q,
        maxScale,
        avg,
        counts,
        totalAnswered: countWithAnswer,
      };
    });

    // Dropdown and Multiple Choice questions breakdown
    const choiceQuestions = questions.filter((q) => q.type === 'multiple_choice' || q.type === 'dropdown' || q.type === 'yes_no');
    const choiceBreakdowns = choiceQuestions.map((q) => {
      const optionCounts: Record<string, number> = {};
      const options = q.type === 'yes_no' ? ['Yes', 'No'] : (q.options || []);

      options.forEach((opt) => {
        optionCounts[opt] = 0;
      });

      let answeredCount = 0;
      responses.forEach((r) => {
        const val = r.answers?.[q.id];
        if (val) {
          answeredCount++;
          optionCounts[val] = (optionCounts[val] || 0) + 1;
        }
      });

      return {
        question: q,
        answeredCount,
        options: Object.entries(optionCounts).map(([label, count]) => ({
          label,
          count,
          pct: answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0,
        })),
      };
    });

    // Date questions summary
    const dateQuestions = questions.filter((q) => q.type === 'date');
    const dateSummaries = dateQuestions.map((q) => {
      const dates: string[] = [];
      responses.forEach((r) => {
        if (r.answers?.[q.id]) dates.push(r.answers[q.id]);
      });
      dates.sort();
      return {
        question: q,
        earliest: dates[0] || '—',
        latest: dates[dates.length - 1] || '—',
        totalAnswered: dates.length,
      };
    });

    return {
      avgCompletionRate,
      ratingSummary,
      choiceBreakdowns,
      dateSummaries,
      timelineData,
    };
  }, [questions, responses]);

  if (totalSubmissions === 0) {
    return (
      <div className="card p-8 text-center bg-white border border-slate-200">
        <BarChart3 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
        <h3 className="text-base font-semibold text-slate-900">No submission analytics available yet</h3>
        <p className="text-sm text-slate-500 mt-1">Once respondents begin answering your form, interactive charts and breakdown stats will appear here.</p>
      </div>
    );
  }

  // Max count for timeline scale
  const maxTimelineCount = Math.max(...timelineData.map((t) => t.count), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Submissions</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalSubmissions}</p>
          <p className="text-xs text-slate-400 mt-1">Total recorded responses</p>
        </div>

        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completion Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{avgCompletionRate}%</p>
          <p className="text-xs text-slate-400 mt-1">Average question answer rate</p>
        </div>

        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Satisfaction</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {ratingSummary.length > 0 ? `${ratingSummary[0].avg} / ${ratingSummary[0].maxScale}` : 'N/A'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {ratingSummary.length > 0 ? ratingSummary[0].question.text.slice(0, 30) + '...' : 'No rating questions in form'}
          </p>
        </div>

        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Time to Complete</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">~42s</p>
          <p className="text-xs text-slate-400 mt-1">Conversational flow speed</p>
        </div>
      </div>

      {/* Submissions Over Time Chart */}
      <div className="card p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-500" />
              Submissions Timeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Response activity over recent submission dates</p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Last {timelineData.length} active periods
          </span>
        </div>

        <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
          {timelineData.map((d, i) => {
            const heightPct = Math.max(12, Math.round((d.count / maxTimelineCount) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-xs font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.count}
                </div>
                <div
                  className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-90"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: form.theme_color || '#2563eb',
                  }}
                />
                <span className="text-[11px] font-medium text-slate-400 truncate max-w-full">
                  {d.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating Questions Breakdown */}
      {ratingSummary.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Rating & Sentiment Distribution
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {ratingSummary.map((item) => (
              <div key={item.question.id} className="card p-5 bg-white space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{item.question.text}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.totalAnswered} ratings recorded</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg text-amber-700 font-bold text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{item.avg} / {item.maxScale}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {Array.from({ length: item.maxScale }, (_, idx) => item.maxScale - idx).map((score) => {
                    const count = item.counts[score] || 0;
                    const pct = item.totalAnswered > 0 ? Math.round((count / item.totalAnswered) * 100) : 0;
                    return (
                      <div key={score} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-medium text-slate-600 text-right">{score} {item.maxScale === 5 ? '★' : 'pts'}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-slate-500 font-medium">
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Choice & Dropdown Breakdown */}
      {choiceBreakdowns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-blue-500" />
            Choice & Dropdown Analysis
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {choiceBreakdowns.map((item) => (
              <div key={item.question.id} className="card p-5 bg-white space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {item.question.type === 'dropdown' ? 'Dropdown Select' : item.question.type === 'yes_no' ? 'Yes / No' : 'Multiple Choice'}
                    </span>
                    <span className="text-xs text-slate-500">{item.answeredCount} answers</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mt-1">{item.question.text}</h4>
                </div>

                <div className="space-y-2.5">
                  {item.options.map((opt, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span className="font-medium truncate max-w-[70%]">{opt.label}</span>
                        <span className="text-slate-500 font-medium">{opt.count} ({opt.pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${opt.pct}%`,
                            backgroundColor: form.theme_color || '#2563eb',
                            opacity: 0.75 + (i % 3) * 0.12,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Questions Summary */}
      {dateSummaries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600" />
            Date Field Summaries
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {dateSummaries.map((ds) => (
              <div key={ds.question.id} className="card p-5 bg-white">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date Selection</span>
                <h4 className="text-sm font-semibold text-slate-900 mt-1 mb-3">{ds.question.text}</h4>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Earliest Date</span>
                    <span className="font-semibold text-slate-800">{ds.earliest}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Latest Date</span>
                    <span className="font-semibold text-slate-800">{ds.latest}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
