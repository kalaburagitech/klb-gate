import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card = ({ children, className, title }: CardProps) => {
  return (
    <div className={cn(
      "bg-white dark:bg-dark-card rounded-[20px] p-6 shadow-soft border border-black/5 dark:border-white/5",
      className
    )}>
      {title && <h3 className="text-lg font-bold text-nature-900 dark:text-white mb-4">{title}</h3>}
      {children}
    </div>
  );
};
