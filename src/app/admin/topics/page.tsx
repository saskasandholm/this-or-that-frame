import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Manage Topics | Admin',
  description: 'Manage and edit topics for This or That',
};

async function getTopics() {
  const topics = await prisma.topic.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  return topics;
}

export default async function TopicsManagementPage() {
  const topics = await getTopics();

  return (
    <div className="topics-management">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Topics</h1>
        <Link 
          href="/admin/topics/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create New Topic
        </Link>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Topic Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="all">All Topics</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="all">All Categories</option>
                  {/* Categories will be populated dynamically */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">By Name</option>
                  <option value="votes">Most Votes</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="topics-list space-y-6">
        {topics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">No topics found. Create your first topic!</p>
          </div>
        ) : (
          topics.map((topic) => (
            <Card key={topic.id} className="overflow-hidden">
              <div className="grid md:grid-cols-[2fr,1fr,auto] border-b">
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{topic.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {topic.category.name}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Created {formatDistanceToNow(new Date(topic.createdAt))} ago</span>
                  </div>
                </div>
                <div className="p-4 flex items-center">
                  <div className="text-sm">
                    <div className="flex items-center mb-1">
                      <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                      <span>
                        {topic.isActive ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" /> Inactive
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      Votes: {topic.votesA + topic.votesB}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center space-x-2">
                  <Link 
                    href={`/admin/topics/edit/${topic.id}`} 
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button className="p-2 bg-red-100 hover:bg-red-200 rounded-md transition-colors">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-4 bg-slate-50">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Option A</h4>
                    <p>{topic.optionA}</p>
                    <div className="text-sm mt-1">
                      Votes: <span className="font-semibold">{topic.votesA}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Option B</h4>
                    <p>{topic.optionB}</p>
                    <div className="text-sm mt-1">
                      Votes: <span className="font-semibold">{topic.votesB}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 