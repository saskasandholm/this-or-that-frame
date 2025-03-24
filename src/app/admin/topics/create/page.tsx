import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TopicForm from '@/components/admin/TopicForm';

export const metadata: Metadata = {
  title: 'Create Topic | Admin',
  description: 'Create a new topic for This or That',
};

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  return categories;
}

export default async function CreateTopicPage() {
  const categories = await getCategories();
  
  return (
    <div className="create-topic">
      <div className="mb-8">
        <Link 
          href="/admin/topics" 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Topics
        </Link>
        
        <h1 className="text-3xl font-bold mt-4">Create New Topic</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Topic Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
} 