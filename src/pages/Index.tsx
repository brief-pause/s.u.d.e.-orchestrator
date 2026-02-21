import { useState, useEffect } from 'react';
import { useProjects, useActiveProject, useSimulationEvents } from '@/hooks/useSupabaseData';
import AppSidebar from '@/components/AppSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import IntakeLab from '@/components/IntakeLab';
import SimulationTheater from '@/components/SimulationTheater';
import ExecutionTerminal from '@/components/ExecutionTerminal';
import ScanningOverlay from '@/components/ScanningOverlay';

const Index = () => {
  const { projects } = useProjects();
  const { activeProjectId, setActive } = useActiveProject();
  const activeProject = projects.find((p) => p.id === activeProjectId) || null;
  const { events } = useSimulationEvents(activeProjectId);
  const [scanning, setScanning] = useState(false);
  const [showExecution, setShowExecution] = useState(false);

  // Show scanning overlay when project transitions to scanning
  useEffect(() => {
    if (activeProject?.status === 'scanning') {
      setScanning(true);
      const timer = setTimeout(() => setScanning(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [activeProject?.status]);

  // Auto-show execution terminal on completed
  useEffect(() => {
    if (activeProject?.status === 'completed') {
      setShowExecution(true);
    }
  }, [activeProject?.status]);

  const handleProjectCreated = (id: string) => {
    setActive(id);
  };

  const isSimulating = activeProject && (activeProject.status === 'simulating' || activeProject.status === 'completed');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActive(id)}
        onNewProject={() => setActive(null)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader project={activeProject} />

        {isSimulating ? (
          <SimulationTheater
            events={events}
            projectName={activeProject?.name || activeProject?.url || 'Unknown'}
          />
        ) : (
          <IntakeLab
            onProjectCreated={handleProjectCreated}
            activeProjectId={activeProjectId}
          />
        )}
      </div>

      <ExecutionTerminal
        visible={showExecution}
        onClose={() => setShowExecution(false)}
        projectName={activeProject?.name || 'Project'}
      />

      <ScanningOverlay visible={scanning} />
    </div>
  );
};

export default Index;
