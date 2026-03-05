import { CheckCircle2, XCircle, Clock3 } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'verified' | 'failed' | 'pending' | 'skipped';
  label: string;
}

export function VerificationBadge({ status, label }: VerificationBadgeProps) {
  const configs = {
    verified: {
      icon: CheckCircle2,
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      iconClass: 'text-emerald-600'
    },
    failed: {
      icon: XCircle,
      className: 'border-rose-200 bg-rose-50 text-rose-800',
      iconClass: 'text-rose-600'
    },
    pending: {
      icon: Clock3,
      className: 'border-amber-200 bg-amber-50 text-amber-800',
      iconClass: 'text-amber-600'
    },
    skipped: {
      icon: Clock3,
      className: 'border-slate-200 bg-slate-50 text-slate-700',
      iconClass: 'text-slate-500'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${config.className}`}>
      <Icon className={`h-5 w-5 ${config.iconClass}`} />
      <span className="text-sm font-semibold sm:text-base">{label}</span>
    </div>
  );
}
