import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DiscoveryProject {
  id: string;
  url: string | null;
  name: string | null;
  status: string;
  market_data: any;
  created_at: string;
}

export interface PersonaSnapshot {
  id: string;
  project_id: string | null;
  name: string;
  traits: { patience: number; anxiety: number; technical: number };
  created_at: string;
}

export interface SimulationEvent {
  id: string;
  project_id: string | null;
  timestamp: string;
  node_name: string | null;
  action: string | null;
  sentiment_vector: { frustration: number; delight: number; confusion: number };
  monologue: string | null;
}

export function useProjects() {
  const [projects, setProjects] = useState<DiscoveryProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase
      .from('discovery_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data as DiscoveryProject[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
    const channel = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discovery_projects' }, () => {
        fetchProjects();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchProjects]);

  return { projects, loading, refetch: fetchProjects };
}

export function useActiveProject() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('app_state').select('*').limit(1).single();
      if (data) setActiveProjectId(data.active_project_id);
    };
    fetch();
  }, []);

  const setActive = async (projectId: string | null) => {
    setActiveProjectId(projectId);
    const { data } = await supabase.from('app_state').select('id').limit(1).single();
    if (data) {
      await supabase.from('app_state').update({ active_project_id: projectId }).eq('id', data.id);
    }
  };

  return { activeProjectId, setActive };
}

export function useSimulationEvents(projectId: string | null) {
  const [events, setEvents] = useState<SimulationEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    if (!projectId) { setEvents([]); return; }
    const { data } = await supabase
      .from('simulation_events')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: true });
    if (data) setEvents(data as SimulationEvent[]);
  }, [projectId]);

  useEffect(() => {
    fetchEvents();
    if (!projectId) return;
    const channel = supabase
      .channel('events-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'simulation_events', filter: `project_id=eq.${projectId}` }, () => {
        fetchEvents();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, fetchEvents]);

  return { events };
}

export function usePersonas(projectId: string | null) {
  const [personas, setPersonas] = useState<PersonaSnapshot[]>([]);

  const fetchPersonas = useCallback(async () => {
    if (!projectId) { setPersonas([]); return; }
    const { data } = await supabase
      .from('persona_snapshots')
      .select('*')
      .eq('project_id', projectId);
    if (data) setPersonas(data as PersonaSnapshot[]);
  }, [projectId]);

  useEffect(() => { fetchPersonas(); }, [fetchPersonas]);

  return { personas, refetch: fetchPersonas };
}
