'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight, Info, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeSectionProps {
  title: string;
  description: string;
  steps?: string[];
  className?: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  title,
  description,
  steps,
  className = '',
}) => {
  return (
    <motion.div
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-4">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base mt-2">{description}</CardDescription>
        </CardHeader>
        {steps && steps.length > 0 && (
          <CardContent className="pt-4">
            <h4 className="font-semibold flex items-center mb-3">
              <Info className="w-4 h-4 mr-2" />
              How it works:
            </h4>
            <ul className="space-y-2">
              {steps.map((step, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Check className="w-4 h-4 mr-2 text-primary mt-1 shrink-0" />
                  <span>{step}</span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <Button variant="gradient" size="sm" className="group">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default WelcomeSection;
