import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { SimulationEvent } from '@/hooks/useSupabaseData';

interface BehavioralAnalyticsProps {
  events: SimulationEvent[];
}

export default function BehavioralAnalytics({ events }: BehavioralAnalyticsProps) {
  // Aggregate sentiment for radar
  const avg = events.reduce(
    (acc, e) => {
      const sv = e.sentiment_vector as any;
      return {
        frustration: acc.frustration + (sv?.frustration || 0),
        delight: acc.delight + (sv?.delight || 0),
        confusion: acc.confusion + (sv?.confusion || 0),
        count: acc.count + 1,
      };
    },
    { frustration: 0, delight: 0, confusion: 0, count: 0 }
  );

  const n = avg.count || 1;
  const radarData = [
    { axis: 'Frustration', value: avg.frustration / n },
    { axis: 'Delight', value: avg.delight / n },
    { axis: 'Confusion', value: avg.confusion / n },
  ];

  // Temporal data for sentiment pulse
  const pulseData = events.map((e, i) => {
    const sv = e.sentiment_vector as any;
    return {
      idx: i,
      frustration: sv?.frustration || 0,
      delight: sv?.delight || 0,
      confusion: sv?.confusion || 0,
    };
  });

  const emptyState = events.length === 0;

  return (
    <motion.div
      className="flex h-full flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Radar Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Sentiment Radar
        </h3>
        {emptyState ? (
          <div className="flex h-48 items-center justify-center text-xs text-muted-foreground font-mono">
            AWAITING DATA...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(240 4% 18%)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: 'hsl(215 16% 60%)', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="hsl(160 84% 39%)" fill="hsl(160 84% 39%)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sentiment Pulse */}
      <div className="rounded-lg border border-border bg-card p-4 flex-1">
        <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Sentiment Pulse
        </h3>
        {emptyState ? (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground font-mono">
            AWAITING DATA...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={pulseData}>
              <CartesianGrid stroke="hsl(240 4% 14%)" strokeDasharray="3 3" />
              <XAxis dataKey="idx" tick={false} axisLine={{ stroke: 'hsl(240 4% 18%)' }} />
              <YAxis domain={[0, 1]} tick={{ fill: 'hsl(215 16% 50%)', fontSize: 9 }} axisLine={{ stroke: 'hsl(240 4% 18%)' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(240 5% 10%)', border: '1px solid hsl(240 4% 18%)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
                labelStyle={{ color: 'hsl(215 16% 70%)' }}
              />
              <Line type="monotone" dataKey="frustration" stroke="hsl(0 72% 51%)" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="delight" stroke="hsl(160 84% 39%)" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="confusion" stroke="hsl(38 92% 50%)" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
