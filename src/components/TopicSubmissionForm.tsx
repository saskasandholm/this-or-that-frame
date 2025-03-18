import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFrameContext } from '../lib/ContextProvider';
import HapticService from '../services/HapticService';
import AudioService from '../services/AudioService';

interface TopicSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Component for submitting new topic suggestions
 */
const TopicSubmissionForm: React.FC<TopicSubmissionFormProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { fid } = useFrameContext();

  // Load categories when component mounts
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategoryId(String(data.categories[0].id));
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setError('Failed to load categories. Please try again.');
      }
    }

    loadCategories();
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter a topic name');
      return false;
    }

    if (name.length < 5 || name.length > 100) {
      setError('Topic name must be between 5 and 100 characters');
      return false;
    }

    if (!optionA.trim() || !optionB.trim()) {
      setError('Please provide both options');
      return false;
    }

    if (optionA.trim() === optionB.trim()) {
      setError('Options must be different');
      return false;
    }

    if (!categoryId) {
      setError('Please select a category');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      HapticService.subtle();
      return;
    }

    if (!fid) {
      setError('You must be logged in with a Farcaster account to submit topics');
      HapticService.subtle();
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          optionA,
          optionB,
          categoryId,
          fid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit topic');
      }

      // Success
      setSuccess(true);
      HapticService.medium();
      AudioService.play('success');

      // Reset form
      setName('');
      setOptionA('');
      setOptionB('');

      // Call success callback after a brief delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error submitting topic:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit topic');
      HapticService.subtle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Suggest a Topic</h2>

      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 text-center"
        >
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-green-400 mb-2">Topic Submitted!</h3>
          <p className="text-gray-300 mb-4">
            Thank you for your contribution. Our moderators will review your submission.
          </p>
          <button
            onClick={onSuccess}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Got it!
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Topic Question
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., 'Apple vs Orange' or 'Morning vs Evening'"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              {100 - name.length} characters remaining
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="optionA" className="block text-sm font-medium text-gray-300 mb-1">
                Option A
              </label>
              <input
                type="text"
                id="optionA"
                value={optionA}
                onChange={e => setOptionA(e.target.value)}
                placeholder="First option"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={30}
              />
            </div>
            <div>
              <label htmlFor="optionB" className="block text-sm font-medium text-gray-300 mb-1">
                Option B
              </label>
              <input
                type="text"
                id="optionB"
                value={optionB}
                onChange={e => setOptionB(e.target.value)}
                placeholder="Second option"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={30}
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.length === 0 ? (
                <option value="">Loading categories...</option>
              ) : (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col space-y-2 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium text-white ${
                isLoading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit Topic'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center mt-4">
            All submissions are reviewed by our moderators before being published.
            <br />
            Please ensure your topic is appropriate and follows our community guidelines.
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default TopicSubmissionForm;
