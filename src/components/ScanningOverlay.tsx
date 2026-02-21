import { motion, AnimatePresence } from 'framer-motion';

interface ScanningOverlayProps {
  visible: boolean;
}

const MeshNode = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.circle
    cx={x}
    cy={y}
    r={3}
    fill="hsl(160 84% 39%)"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0.4, 1], scale: [0, 1.5, 1, 1.2] }}
    transition={{ duration: 2, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const MeshLine = ({ delay, x1, y1, x2, y2 }: { delay: number; x1: number; y1: number; x2: number; y2: number }) => (
  <motion.line
    x1={x1} y1={y1} x2={x2} y2={y2}
    stroke="hsl(160 84% 39%)"
    strokeWidth={0.5}
    initial={{ opacity: 0, pathLength: 0 }}
    animate={{ opacity: [0, 0.6, 0.2], pathLength: [0, 1] }}
    transition={{ duration: 1.5, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

export default function ScanningOverlay({ visible }: ScanningOverlayProps) {
  const nodes = [
    { x: 200, y: 100 }, { x: 350, y: 80 }, { x: 500, y: 120 },
    { x: 150, y: 200 }, { x: 300, y: 220 }, { x: 450, y: 190 },
    { x: 250, y: 300 }, { x: 400, y: 310 }, { x: 550, y: 280 },
    { x: 180, y: 370 }, { x: 340, y: 380 }, { x: 480, y: 360 },
  ];

  const lines = [
    [0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[3,6],[4,7],[5,8],[6,7],[7,8],[6,9],[7,10],[8,11],[9,10],[10,11]
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'hsl(240 6% 6% / 0.92)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col items-center gap-8">
            <svg width="700" height="450" viewBox="0 0 700 450" className="opacity-80">
              {lines.map(([a, b], i) => (
                <MeshLine key={i} delay={i * 0.1} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
              ))}
              {nodes.map((n, i) => (
                <MeshNode key={i} delay={i * 0.15} x={n.x} y={n.y} />
              ))}
              {/* Scanning line */}
              <motion.rect
                x={0} width={700} height={2}
                fill="hsl(160 84% 39%)"
                opacity={0.4}
                initial={{ y: 0 }}
                animate={{ y: [0, 450, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </svg>

            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-semibold tracking-wider text-primary">
                SCANNING TARGET
              </h2>
              <p className="font-mono text-sm text-muted-foreground">
                Analyzing structure · Mapping nodes · Building graph
              </p>
              <motion.div
                className="h-0.5 w-48 rounded-full bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
