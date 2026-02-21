import { motion } from 'framer-motion';
import SyntheticStream from './SyntheticStream';
import BehavioralAnalytics from './BehavioralAnalytics';
import type { SimulationEvent } from '@/hooks/useSupabaseData';

interface SimulationTheaterProps {
  events: SimulationEvent[];
  projectName: string;
}

export default function SimulationTheater({ events, projectName }: SimulationTheaterProps) {
  return (
    <motion.div
      className="flex flex-1 flex-col gap-4 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Live Map Header */}
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Live Simulation — {projectName}
        </h2>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: Terminal Stream */}
        <div className="flex-1 min-w-0">
          <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Synthetic Stream
          </div>
          <div className="h-[calc(100%-24px)]">
            <SyntheticStream events={events} />
          </div>
        </div>

        {/* Right: Analytics */}
        <div className="w-80 shrink-0">
          <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Behavioral Analytics
          </div>
          <div className="h-[calc(100%-24px)]">
            <BehavioralAnalytics events={events} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
