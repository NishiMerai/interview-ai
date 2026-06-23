import { motion } from 'framer-motion';

export default function MetricCard({ title, value, suffix = '', helper }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-5"
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">{value}</span>
        <span className="mb-1 text-sm font-semibold text-brand-600">{suffix}</span>
      </div>
      {helper && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
    </motion.div>
  );
}
