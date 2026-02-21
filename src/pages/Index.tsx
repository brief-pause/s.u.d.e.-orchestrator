import { useState, useEffect } from 'react';
import { useProjects, useActiveProject, useSimulationEvents } from '@/hooks/useSupabaseData';
import AppSidebar from '@/components/AppSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import IntakeLab from '@/components/IntakeLab';
import SyntheticStream from '@/components/SyntheticStream';
import BehavioralAnalytics from '@/components/BehavioralAnalytics';
import ExecutionTerminal from '@/components/ExecutionTerminal';
import ScanningOverlay from '@/components/ScanningOverlay';

const Index = () => {
  const { projects } = useProjects();
  const { activeProjectId, setActive } = useActiveProject();
  const activeProject = projects.find((p) => p.id === activeProjectId) || null;
  const { events } = useSimulationEvents(activeProjectId);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (activeProject?.status === 'scanning') {
      setScanning(true);
      const timer = setTimeout(() => setScanning(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [activeProject?.status]);

  const handleProjectCreated = (id: string) => {
    setActive(id);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <DashboardHeader project={activeProject} />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN: Sidebar + Persona Archetypes */}
        <AppSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => setActive(id)}
          onNewProject={() => setActive(null)}
        />

        {/* CENTER COLUMN: Intake Lab + Digital Twin Map */}
        <div className="flex flex-1 flex-col overflow-y-auto border-r border-border">
          {/* URL Intake */}
          <div className="shrink-0 border-b border-border">
            <IntakeLab
              onProjectCreated={handleProjectCreated}
              activeProjectId={activeProjectId}
            />
          </div>

          {/* Digital Twin Map / Execution Terminal */}
          <div className="flex-1 min-h-0 p-4">
            <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Execution Terminal
            </div>
            <div className="h-[calc(100%-20px)]">
              <ExecutionTerminal
                projectName={activeProject?.name || 'Project'}
                status={activeProject?.status || null}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Simulation Theater + Analytics */}
        <div className="flex w-[420px] shrink-0 flex-col overflow-y-auto">
          {/* Synthetic Stream */}
          <div className="flex-1 min-h-0 border-b border-border p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Simulation Theater — {activeProject?.name || 'No Project'}
              </span>
            </div>
            <div className="h-[calc(100%-28px)]">
              <SyntheticStream events={events} />
            </div>
          </div>

          {/* Behavioral Analytics */}
          <div className="shrink-0 p-4">
            <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Behavioral Analytics
            </div>
            <BehavioralAnalytics events={events} />
          </div>
        </div>
      </div>

      <ScanningOverlay visible={scanning} />
    </div>
  );
};

export default Index;
