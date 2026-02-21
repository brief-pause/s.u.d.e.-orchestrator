import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';

interface PersonaCardProps {
  name: string;
  description: string;
  icon: string;
  defaultTraits: { patience: number; anxiety: number; technical: number };
  projectId: string | null;
  onSaved?: () => void;
}

export default function PersonaCard({ name, description, icon, defaultTraits, projectId, onSaved }: PersonaCardProps) {
  const [traits, setTraits] = useState(defaultTraits);
  const [synced, setSynced] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSync = async () => {
    if (!projectId) return;
    setSaving(true);
    await supabase.from('persona_snapshots').insert({
      project_id: projectId,
      name,
      traits,
    });
    setSaving(false);
    setSynced(true);
    onSaved?.();
    setTimeout(() => setSynced(false), 2000);
  };

  return (
    <motion.div
      className="rounded-lg border border-border bg-card p-5 transition-all hover:cyber-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {(['patience', 'anxiety', 'technical'] as const).map((trait) => (
          <div key={trait} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-mono uppercase text-muted-foreground">{trait}</span>
              <span className="font-mono text-primary">{traits[trait].toFixed(2)}</span>
            </div>
            <Slider
              value={[traits[trait]]}
              onValueChange={([v]) => setTraits((t) => ({ ...t, [trait]: v }))}
              min={0}
              max={1}
              step={0.01}
              className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary [&_.relative>div]:bg-primary"
            />
          </div>
        ))}
      </div>

      <motion.button
        className={`mt-5 w-full rounded-md py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
          synced
            ? 'bg-primary text-primary-foreground cyber-glow-strong'
            : 'border border-border bg-secondary text-foreground hover:border-primary hover:text-primary'
        }`}
        onClick={handleSync}
        disabled={saving || !projectId}
        whileTap={{ scale: 0.97 }}
      >
        {saving ? 'SYNCING...' : synced ? '✓ SYNCED' : 'SYNC TO PERSONA'}
      </motion.button>
    </motion.div>
  );
}
