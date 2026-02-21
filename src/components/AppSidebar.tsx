import { motion } from 'framer-motion';
import { Zap, FlaskConical, Radio, Plus } from 'lucide-react';
import type { DiscoveryProject } from '@/hooks/useSupabaseData';

interface AppSidebarProps {
  projects: DiscoveryProject[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}

const statusColors: Record<string, string> = {
  idle: 'bg-muted-foreground',
  scanning: 'bg-primary animate-pulse-glow',
  simulating: 'bg-yellow-500',
  completed: 'bg-primary',
};

export default function AppSidebar({ projects, activeProjectId, onSelectProject, onNewProject }: AppSidebarProps) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wider text-foreground">S.U.D.E.</h1>
          <p className="text-[10px] font-mono text-muted-foreground">DISCOVERY ENGINE</p>
        </div>
      </div>

      {/* Active Sprints */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
            Active Sprints
          </span>
          <button
            onClick={onNewProject}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {projects.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-all ${
                activeProjectId === p.id
                  ? 'bg-sidebar-accent text-foreground cyber-border'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className={`h-2 w-2 rounded-full ${statusColors[p.status] || statusColors.idle}`} />
              <span className="truncate">{p.name || p.url || 'Untitled'}</span>
            </motion.button>
          ))}
        </div>

        {/* Persona Lab */}
        <div className="mt-6 mb-2 px-2">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
            Persona Lab
          </span>
        </div>
        {[
          { icon: '🧪', label: 'Impatient Novice' },
          { icon: '🔬', label: 'Anxious Expert' },
          { icon: '⚡', label: 'Power User' },
        ].map((archetype, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-default"
          >
            <span>{archetype.icon}</span>
            <span>{archetype.label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <Radio className="h-3 w-3 text-primary" />
          <span>SYSTEM NOMINAL</span>
        </div>
      </div>
    </aside>
  );
}
