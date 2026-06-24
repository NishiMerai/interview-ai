import { motion } from 'framer-motion';

export default function MetricCard({ title, value, suffix = '', helper }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="glass-card relative overflow-hidden !p-6"
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl" />
      
      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black gradient-text">{value}</span>
        {suffix && <span className="text-sm font-bold text-indigo-400">{suffix}</span>}
      </div>
      {helper && (
        <p className="mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
           <div className="w-1 h-1 rounded-full bg-indigo-400" />
           {helper}
        </p>
      )}
    </motion.div>
  );
}
