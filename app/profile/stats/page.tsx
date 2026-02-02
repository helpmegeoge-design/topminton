"use client";

import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Icons } from "@/components/icons";

const mockStats = {
  overall: {
    totalMatches: 156,
    wins: 98,
    losses: 58,
    winRate: 62.8,
    currentStreak: 5,
    bestStreak: 12,
  },
  skills: [
    { name: "พลัง", value: 75 },
    { name: "ความเร็ว", value: 82 },
    { name: "เทคนิค", value: 68 },
    { name: "ความแม่นยำ", value: 71 },
    { name: "ความอดทน", value: 85 },
    { name: "กลยุทธ์", value: 65 },
  ],
  recentForm: ["W", "W", "L", "W", "W"],
  monthlyMatches: [12, 15, 8, 18, 14, 16],
};

// Simple SVG Radar Chart Component
function RadarChart({ skills }: { skills: { name: string; value: number }[] }) {
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const angleStep = (2 * Math.PI) / skills.length;

  // Calculate points for the skill polygon
  const skillPoints = skills.map((skill, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (skill.value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  // Calculate label positions
  const labelPoints = skills.map((skill, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius + 25;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      name: skill.name,
      value: skill.value,
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[250px] mx-auto">
      {/* Background circles */}
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={skills
            .map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = scale * radius;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {skills.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        );
      })}

      {/* Skill polygon */}
      <polygon
        points={skillPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="hsl(var(--primary))"
        fillOpacity={0.3}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
      />

      {/* Skill points */}
      {skillPoints.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r={4} fill="hsl(var(--primary))" />
      ))}

      {/* Labels */}
      {labelPoints.map((label, i) => (
        <text
          key={i}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-[10px] font-medium"
        >
          {label.name}
        </text>
      ))}
    </svg>
  );
}

export default function ProfileStatsPage() {
  return (
    <AppShell title="สถิติของฉัน" showBack backHref="/profile">
      <div className="p-4 pb-24 space-y-6">
        {/* Overall Stats */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">ภาพรวม</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{mockStats.overall.totalMatches}</p>
              <p className="text-xs text-muted-foreground">แมตช์ทั้งหมด</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{mockStats.overall.wins}</p>
              <p className="text-xs text-muted-foreground">ชนะ</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{mockStats.overall.losses}</p>
              <p className="text-xs text-muted-foreground">แพ้</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <span className="text-sm font-semibold text-primary">{mockStats.overall.winRate}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${mockStats.overall.winRate}%` }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Skill Radar */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">ความสามารถ</h3>
          <RadarChart skills={mockStats.skills} />

          <div className="grid grid-cols-2 gap-3 mt-4">
            {mockStats.skills.map((skill) => (
              <div key={skill.name} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{skill.name}</span>
                    <span className="text-xs font-medium text-foreground">{skill.value}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${skill.value}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Form */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">ฟอร์ม 5 แมตช์ล่าสุด</h3>
          <div className="flex items-center justify-center gap-2">
            {mockStats.recentForm.map((result, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  result === "W" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {result}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <Icons.trophy size={16} className="text-yellow-500" />
              <span className="text-muted-foreground">
                สตรีคปัจจุบัน: <strong className="text-foreground">{mockStats.overall.currentStreak}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.star size={16} className="text-primary" />
              <span className="text-muted-foreground">
                สตรีคสูงสุด: <strong className="text-foreground">{mockStats.overall.bestStreak}</strong>
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Monthly Activity */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">กิจกรรมรายเดือน</h3>
          <div className="flex items-end justify-between h-24 gap-2">
            {["ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/20 rounded-t transition-all hover:bg-primary/30"
                  style={{ height: `${(mockStats.monthlyMatches[i] / 20) * 100}%` }}
                >
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{ height: `${(mockStats.monthlyMatches[i] / 20) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{month}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
