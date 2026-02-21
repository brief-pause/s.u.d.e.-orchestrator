import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Send, Settings } from 'lucide-react';

interface ExecutionTerminalProps {
  visible: boolean;
  onClose: () => void;
  projectName: string;
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

export default function ExecutionTerminal({ visible, onClose, projectName }: ExecutionTerminalProps) {
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                Execution Terminal
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Settings Drawer */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                className="border-b border-border bg-secondary px-5 py-4"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  CodeWords Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-webhook.example.com/fix"
                  className="w-full rounded-md border border-border bg-card px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              GitHub Ready Fix — {projectName}
            </div>
            <div className="rounded-lg border border-border bg-terminal-bg p-4 font-mono text-xs leading-relaxed text-terminal-text whitespace-pre-wrap">
              {SAMPLE_FIX}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-border px-5 py-4">
            <button
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-secondary py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'COPIED' : 'COPY PROMPT'}
            </button>
            <button
              onClick={handleCommit}
              disabled={committing}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {committing ? 'COMMITTING...' : 'COMMIT TO GITHUB'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
