import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PersonaCard from './PersonaCard';

interface IntakeLabProps {
  onProjectCreated: (id: string) => void;
  activeProjectId: string | null;
}

const archetypes = [
  {
    name: 'Impatient Novice',
    description: 'Low patience, high anxiety, minimal technical skill',
    icon: '🧪',
    traits: { patience: 0.2, anxiety: 0.8, technical: 0.15 },
  },
  {
    name: 'Anxious Expert',
    description: 'Moderate patience, high anxiety, high technical skill',
    icon: '🔬',
    traits: { patience: 0.5, anxiety: 0.9, technical: 0.85 },
  },
  {
    name: 'Power User',
    description: 'High patience, low anxiety, expert technical skill',
    icon: '⚡',
    traits: { patience: 0.9, anxiety: 0.1, technical: 0.95 },
  },
];

export default function IntakeLab({ onProjectCreated, activeProjectId }: IntakeLabProps) {
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setSubmitting(true);
    try {
      // 1. Insert the project row
      const { data } = await supabase
        .from('discovery_projects')
        .insert({ url: url.trim(), name: new URL(url.trim()).hostname, status: 'scanning' })
        .select()
        .single();

      if (data) {
        onProjectCreated(data.id);

        // 2. Invoke the trigger-sentinel edge function
        await supabase.functions.invoke('trigger-sentinel', {
          body: { project_id: data.id },
        });
      }
    } catch (err) {
      console.error('Scan failed:', err);
    }
    setUrl('');
    setSubmitting(false);
  };

  return (
    <div className="p-5">
      {/* URL Input */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="mb-1 text-lg font-bold tracking-tight text-foreground">
          Target Acquisition
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Enter a URL or Figma link to begin synthetic user discovery
        </p>

        <div className="cyber-glow cyber-border relative flex items-center rounded-lg bg-card p-1">
          <Search className="ml-3 h-4 w-4 text-muted-foreground" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="https://target-application.com"
            className="flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <motion.button
            onClick={handleSubmit}
            disabled={submitting || !url.trim()}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? 'INIT...' : 'SCAN'}
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Persona Cards - compact row */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {archetypes.map((a) => (
          <PersonaCard
            key={a.name}
            {...a}
            defaultTraits={a.traits}
            projectId={activeProjectId}
          />
        ))}
      </motion.div>
    </div>
  );
}
