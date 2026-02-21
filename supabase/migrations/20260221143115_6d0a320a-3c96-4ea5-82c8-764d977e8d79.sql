
-- Discovery Projects
CREATE TABLE public.discovery_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'scanning', 'simulating', 'completed')),
  market_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.discovery_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to discovery_projects" ON public.discovery_projects FOR ALL USING (true) WITH CHECK (true);

-- Persona Snapshots
CREATE TABLE public.persona_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.discovery_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  traits JSONB NOT NULL DEFAULT '{"patience": 0.5, "anxiety": 0.5, "technical": 0.5}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.persona_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to persona_snapshots" ON public.persona_snapshots FOR ALL USING (true) WITH CHECK (true);

-- Simulation Events
CREATE TABLE public.simulation_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.discovery_projects(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  node_name TEXT,
  action TEXT,
  sentiment_vector JSONB DEFAULT '{"frustration": 0.0, "delight": 0.0, "confusion": 0.0}',
  monologue TEXT
);
ALTER TABLE public.simulation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to simulation_events" ON public.simulation_events FOR ALL USING (true) WITH CHECK (true);

-- App State
CREATE TABLE public.app_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  active_project_id UUID REFERENCES public.discovery_projects(id) ON DELETE SET NULL
);
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to app_state" ON public.app_state FOR ALL USING (true) WITH CHECK (true);

-- Insert default app state
INSERT INTO public.app_state (id) VALUES (gen_random_uuid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.simulation_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discovery_projects;
