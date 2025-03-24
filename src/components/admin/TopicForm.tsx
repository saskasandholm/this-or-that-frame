'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@prisma/client';
import { Calendar, Image } from 'lucide-react';

interface TopicFormProps {
  categories: Category[];
  initialData?: {
    id?: number;
    name: string;
    categoryId: number;
    optionA: string;
    optionB: string;
    imageA?: string;
    imageB?: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
  };
}

export default function TopicForm({ categories, initialData }: TopicFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    categoryId: initialData?.categoryId || (categories[0]?.id || 0),
    optionA: initialData?.optionA || '',
    optionB: initialData?.optionB || '',
    imageA: initialData?.imageA || '',
    imageB: initialData?.imageB || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    isActive: initialData?.isActive ?? true,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const endpoint = initialData?.id 
        ? `/api/admin/topics/${initialData.id}` 
        : '/api/admin/topics';
      
      const method = initialData?.id ? 'PATCH' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: Number(formData.categoryId),
          endDate: formData.endDate || null,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save topic');
      }
      
      router.push('/admin/topics');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Topic Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="e.g. Coffee vs Tea"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="categoryId">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="optionA">
            Option A
          </label>
          <textarea
            id="optionA"
            name="optionA"
            required
            value={formData.optionA}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows={2}
            placeholder="First option"
          />
          
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1" htmlFor="imageA">
              <div className="flex items-center">
                <Image className="w-4 h-4 mr-1" />
                Image URL (Optional)
              </div>
            </label>
            <input
              id="imageA"
              name="imageA"
              type="text"
              value={formData.imageA}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="https://example.com/image-a.jpg"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="optionB">
            Option B
          </label>
          <textarea
            id="optionB"
            name="optionB"
            required
            value={formData.optionB}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows={2}
            placeholder="Second option"
          />
          
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1" htmlFor="imageB">
              <div className="flex items-center">
                <Image className="w-4 h-4 mr-1" />
                Image URL (Optional)
              </div>
            </label>
            <input
              id="imageB"
              name="imageB"
              type="text"
              value={formData.imageB}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="https://example.com/image-b.jpg"
            />
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="startDate">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Start Date
            </div>
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="endDate">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              End Date (Optional)
            </div>
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
      
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          <span>Make topic active immediately</span>
        </label>
        <p className="text-sm text-gray-500 mt-1">
          If unchecked, the topic will be created but not shown to users until activated.
        </p>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => router.push('/admin/topics')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Topic' : 'Create Topic'}
        </button>
      </div>
    </form>
  );
} 