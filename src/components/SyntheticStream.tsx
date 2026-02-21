import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { SimulationEvent } from '@/hooks/useSupabaseData';

interface SyntheticStreamProps {
  events: SimulationEvent[];
}

export default function SyntheticStream({ events }: SyntheticStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initText, setInitText] = useState('');
  const fullText = 'INITIALIZING SYNTHETIC AGENTS...';

  useEffect(() => {
    if (events.length > 0) return;
    let i = 0;
    const interval = setInterval(() => {
      setInitText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) i = 0;
    }, 80);
    return () => clearInterval(interval);
  }, [events.length]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border bg-terminal-bg p-6">
        <span className="font-mono text-sm text-terminal-text typing-cursor">{initText}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col gap-0.5 overflow-y-auto rounded-lg border border-border bg-terminal-bg p-4 font-mono text-xs"
    >
      {events.map((event, i) => {
        const ts = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false });
        const sv = event.sentiment_vector as any;
        return (
          <motion.div
            key={event.id}
            className="flex gap-2 leading-relaxed"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <span className="shrink-0 text-muted-foreground">[{ts}]</span>
            <span className="text-primary">{event.node_name || 'AGENT'}</span>
            <span className="text-foreground">{event.action}</span>
            {event.monologue && (
              <span className="text-muted-foreground italic">"{event.monologue}"</span>
            )}
            {sv && (
              <span className="ml-auto shrink-0 text-muted-foreground">
                F:{sv.frustration?.toFixed(1)} D:{sv.delight?.toFixed(1)} C:{sv.confusion?.toFixed(1)}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
