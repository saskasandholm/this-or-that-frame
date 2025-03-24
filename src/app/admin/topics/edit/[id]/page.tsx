import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TopicForm from '@/components/admin/TopicForm';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Edit Topic | Admin',
  description: 'Edit an existing topic',
};

// Update the interface to match Next.js 15 PageProps
type EditTopicPageProps = {
  params: Promise<{ id: string }>;
};

async function getTopic(id: number) {
  const topic = await prisma.topic.findUnique({
    where: { id },
  });
  
  return topic;
}

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

export default async function EditTopicPage({ params }: EditTopicPageProps) {
  // Await the params Promise to get the actual parameters
  const resolvedParams = await params;
  const topicId = parseInt(resolvedParams.id);
  
  if (isNaN(topicId)) {
    notFound();
  }
  
  const [topic, categories] = await Promise.all([
    getTopic(topicId),
    getCategories()
  ]);
  
  if (!topic) {
    notFound();
  }
  
  return (
    <div className="edit-topic">
      <div className="mb-8">
        <Link 
          href="/admin/topics" 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Topics
        </Link>
        
        <h1 className="text-3xl font-bold mt-4">Edit Topic</h1>
        <p className="text-gray-500 mt-1">
          Editing "{topic.name}"
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Topic Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicForm 
            categories={categories} 
            initialData={{
              id: topic.id,
              name: topic.name,
              categoryId: topic.categoryId,
              optionA: topic.optionA,
              optionB: topic.optionB,
              imageA: topic.imageA || '',
              imageB: topic.imageB || '',
              startDate: topic.startDate,
              endDate: topic.endDate || undefined,
              isActive: topic.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
} 