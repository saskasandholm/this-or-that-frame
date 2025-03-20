import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrendingTopicCardProps {
  topic: {
    id: string;
    title: string;
    totalVotes: number;
    category: string;
    trend: string;
  };
  rank: number;
}

const TrendingTopicCard: React.FC<TrendingTopicCardProps> = ({ topic, rank }) => {
  // Determine trend color
  const getTrendColor = (trend: string) => {
    if (trend.includes('+')) return 'text-green-500';
    if (trend.includes('-')) return 'text-red-500';
    return 'text-blue-500';
  };

  // Function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technology':
        return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M16.28 13.61C15.15 14.74 13.53 15.09 12.1 14.64L9.51001 17.22C9.33001 17.41 8.96001 17.53 8.69001 17.49L7.49001 17.33C7.09001 17.28 6.73001 16.9 6.67001 16.51L6.51001 15.31C6.47001 15.04 6.60001 14.68 6.78001 14.49L9.36001 11.91C8.92001 10.48 9.26001 8.86001 10.39 7.73001C12.01 6.11001 14.65 6.11001 16.28 7.73001C17.9 9.34001 17.9 11.98 16.28 13.61Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M10.45 16.28L9.59998 15.42" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path><path d="M13.3945 10.7H13.4035" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
      case 'food':
        return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.79 10.47V17.79C17.79 20.12 15.9 22 13.58 22H6.21C3.89 22 2 20.11 2 17.79V10.47C2 8.14 3.89 6.26 6.21 6.26H13.58C15.9 6.26 17.79 8.15 17.79 10.47Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M5.5 4V2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M9.5 4V2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M13.5 4V2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M22 19.75V15.25C22 13.35 20.4 11.75 18.5 11.75H17.79V17.79C17.79 20.12 15.9 22 13.58 22H7.52C8.47 22 9.34 21.82 10.12 21.49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
      case 'travel':
        return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M7.99998 3H8.99998C7.04998 8.84 7.04998 15.16 8.99998 21H7.99998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15 3C16.95 8.84 16.95 15.16 15 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M3 16V15C8.84 16.95 15.16 16.95 21 15V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M3 9.0001C8.84 7.0501 15.16 7.0501 21 9.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
      case 'entertainment':
        return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M9.10001 12V10.52C9.10001 8.60999 10.45 7.83999 12.1 8.78999L13.38 9.52999L14.66 10.27C16.31 11.22 16.31 12.78 14.66 13.73L13.38 14.47L12.1 15.21C10.45 16.16 9.10001 15.38 9.10001 13.48V12Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary">
            <span className="text-sm font-semibold">{rank}</span>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-xs py-0 px-2">
            {getCategoryIcon(topic.category)}
            <span>{topic.category}</span>
          </Badge>
        </div>
        <div className={`flex items-center text-xs gap-1 font-medium ${getTrendColor(topic.trend)}`}>
          <TrendingUp className="h-3 w-3" />
          {topic.trend}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3 hover:text-primary transition-colors">
        {topic.title}
      </h3>

      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Users className="h-4 w-4" />
        <span>{topic.totalVotes.toLocaleString()} votes</span>
      </div>
    </motion.div>
  );
};

export default TrendingTopicCard;
