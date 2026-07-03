import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { api } from "../api";
import EmptyState from "./EmptyState";

type ProgressEntry = {
  assignmentId: number;
  task: string;
  turnInDate: string;
  deadline: string;
  grade: number;
  maxScore: number;
  percentage: number;
  isLate: boolean;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ProgressChart({ studentId }: { studentId: number }) {
  const [data, setData] = useState<ProgressEntry[] | null>(null);

  useEffect(() => {
    setData(null);
    api
      .getStudentProgress(studentId)
      .then(d => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]));
  }, [studentId]);

  if (data === null) {
    return <p className="submission-meta">Loading progress...</p>;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No graded work yet"
        description="Once assignments are graded, the grade trend will show up here."
        compact
        tone="accent"
      />
    );
  }

  const chartData = data.map(entry => ({
    ...entry,
    label: formatDate(entry.turnInDate),
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
          <Tooltip
            formatter={(value, _name, item) => {
              const entry = item?.payload as (typeof chartData)[number];
              return [`${entry.grade} / ${entry.maxScore} (${value}%)${entry.isLate ? " · Late" : ""}`, entry.task];
            }}
            labelFormatter={() => ""}
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <ul className="submission-files" style={{ marginTop: "0.5rem" }}>
        {chartData.map(entry => (
          <li key={entry.assignmentId} className="submission-files__label" style={{ fontWeight: 400 }}>
            {formatDate(entry.turnInDate)} · {entry.task} — {entry.grade}/{entry.maxScore}
            {entry.isLate && <span className="tag tag-red" style={{ marginLeft: "0.5rem" }}>Late</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
