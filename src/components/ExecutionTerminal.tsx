import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Send, Settings } from 'lucide-react';

interface ExecutionTerminalProps {
  projectName: string;
  status: string | null;
}

const SAMPLE_FIX = `## Recommended Fix

### File: \`src/components/Checkout.tsx\`

\`\`\`diff
- const handleSubmit = async () => {
+ const handleSubmit = async (e: FormEvent) => {
+   e.preventDefault();
    setLoading(true);
    try {
-     await processPayment(cart);
+     const validated = validateCart(cart);
+     if (!validated.success) {
+       setError(validated.error);
+       return;
+     }
+     await processPayment(validated.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
\`\`\`

**Impact**: Prevents unvalidated cart data from reaching payment processor.
**Confidence**: 0.92
`;

export default function ExecutionTerminal({ projectName, status }: ExecutionTerminalProps) {
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [committing, setCommitting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLE_FIX);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommit = async () => {
    if (!webhookUrl) {
      setShowSettings(true);
      return;
    }
    setCommitting(true);
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectName, fix: SAMPLE_FIX }),
      });
    } catch {
      // silently handle
    }
    setCommitting(false);
  };

  // Empty state when no project is completed
  if (status !== 'completed') {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border bg-card">
        <div className="text-center">
          <div className="font-mono text-xs text-muted-foreground mb-1">EXECUTION TERMINAL</div>
          <div className="font-mono text-[10px] text-muted-foreground/60">
            {status ? `STATUS: ${status.toUpperCase()} — AWAITING COMPLETION...` : 'NO ACTIVE PROJECT — AWAITING DATA...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex h-full flex-col rounded-lg border border-border bg-card overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-foreground">
            GitHub Ready Fix — {projectName}
          </span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="border-b border-border bg-secondary px-4 py-3">
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            CodeWords Webhook URL
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-webhook.example.com/fix"
            className="w-full rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-lg border border-border bg-terminal-bg p-3 font-mono text-xs leading-relaxed text-terminal-text whitespace-pre-wrap">
          {SAMPLE_FIX}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border px-4 py-3">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-secondary py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'COPIED' : 'COPY PROMPT'}
        </button>
        <button
          onClick={handleCommit}
          disabled={committing}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-3 w-3" />
          {committing ? 'COMMITTING...' : 'COMMIT TO GITHUB'}
        </button>
      </div>
    </motion.div>
  );
}
