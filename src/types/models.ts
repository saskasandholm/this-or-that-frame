import { Category } from '@prisma/client';

export interface CategoryWithTopicsCount extends Category {
  _count?: {
    topics: number;
  };
} 