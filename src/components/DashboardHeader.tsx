import { motion } from 'framer-motion';
import type { DiscoveryProject } from '@/hooks/useSupabaseData';

interface DashboardHeaderProps {
  project: DiscoveryProject | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  idle: { label: 'IDLE', color: 'bg-muted-foreground' },
  scanning: { label: 'SCANNING', color: 'bg-primary animate-pulse' },
  simulating: { label: 'SIMULATING', color: 'bg-yellow-500 animate-pulse' },
  completed: { label: 'COMPLETED', color: 'bg-primary' },
};

export default function DashboardHeader({ project }: DashboardHeaderProps) {
  const status = project ? statusConfig[project.status] || statusConfig.idle : statusConfig.idle;

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <span>S.U.D.E.</span>
        <span>/</span>
        <span className="text-foreground">{project?.name || project?.url || 'Dashboard'}</span>
        {project && (
          <>
            <span>/</span>
            <span className="text-primary">{status.label}</span>
          </>
        )}
      </div>

      {/* Agent Status */}
      <div className="flex items-center gap-4">
        {[
          { label: 'CRAWLER', active: project?.status === 'scanning' },
          { label: 'SYNTH', active: project?.status === 'simulating' },
          { label: 'ANALYZER', active: project?.status === 'completed' },
        ].map((agent) => (
          <div key={agent.label} className="flex items-center gap-1.5">
            <motion.div
              className={`h-1.5 w-1.5 rounded-full ${agent.active ? 'bg-primary' : 'bg-muted-foreground'}`}
              animate={agent.active ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono text-muted-foreground">{agent.label}</span>
          </div>
        ))}
      </div>
    </header>
  );
}
