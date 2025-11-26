import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'verified' | 'failed' | 'pending' | 'skipped';
  label: string;
}

export function VerificationBadge({ status, label }: VerificationBadgeProps) {
  const configs = {
    verified: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    failed: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    pending: {
      icon: Clock,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    skipped: {
      icon: Clock,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <Icon className={`w-5 h-5 ${config.iconColor}`} />
      <span className={`font-medium ${config.textColor}`}>{label}</span>
    </div>
  );
}
