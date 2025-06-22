import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral'
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {change && (
          <p className={`text-xs ${getChangeColor()}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;