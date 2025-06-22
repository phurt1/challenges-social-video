import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Very Weak', color: 'bg-red-500' },
      { score: 2, label: 'Weak', color: 'bg-orange-500' },
      { score: 3, label: 'Fair', color: 'bg-yellow-500' },
      { score: 4, label: 'Good', color: 'bg-blue-500' },
      { score: 5, label: 'Strong', color: 'bg-green-500' }
    ];
    
    return levels[score];
  }, [password]);
  
  if (!password) return null;
  
  return (
    <div className="space-y-2">
      <Progress value={(strength.score / 5) * 100} className="h-2" />
      <p className={cn('text-sm', strength.color.replace('bg-', 'text-'))}>
        {strength.label}
      </p>
    </div>
  );
};