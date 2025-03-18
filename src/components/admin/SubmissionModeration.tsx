import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFrameContext } from '../../lib/ContextProvider';
import HapticService from '../../services/HapticService';

interface Submission {
  id: number;
  name: string;
  optionA: string;
  optionB: string;
  categoryId: number;
  fid: number;
  status: string;
  reason: string | null;
  createdAt: string;
  category: {
    name: string;
    description: string | null;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface SubmissionModerationProps {
  onClose?: () => void;
}

/**
 * Admin component for moderating topic submissions
 */
const SubmissionModeration: React.FC<SubmissionModerationProps> = ({ onClose }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { fid } = useFrameContext();

  // Load submissions when component mounts or filters change
  useEffect(() => {
    if (!fid) return;

    async function loadSubmissions() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/submissions?fid=${fid}&status=${statusFilter}&page=${pagination.page}&limit=${pagination.limit}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load submissions');
        }

        setSubmissions(data.submissions || []);
        setPagination(data.pagination || pagination);
      } catch (error) {
        console.error('Error loading submissions:', error);
        setError(error instanceof Error ? error.message : 'Failed to load submissions');
      } finally {
        setIsLoading(false);
      }
    }

    loadSubmissions();
  }, [fid, statusFilter, pagination.page, pagination.limit]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleApprove = async (submission: Submission) => {
    if (!fid) return;

    try {
      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          adminFid: fid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve submission');
      }

      HapticService.medium();

      // Update local state
      setSubmissions(prev => prev.filter(s => s.id !== submission.id));
      setPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));

      // Show success message
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error approving submission:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve submission');
      HapticService.subtle();
    }
  };

  const handleReject = (submission: Submission) => {
    setSelectedSubmission(submission);
    setRejectionReason('');
    HapticService.subtle();
  };

  const confirmReject = async () => {
    if (!fid || !selectedSubmission) return;

    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      HapticService.subtle();
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${selectedSubmission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          reason: rejectionReason,
          adminFid: fid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject submission');
      }

      HapticService.medium();

      // Update local state
      setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission.id));
      setPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));

      // Close modal
      setSelectedSubmission(null);
      setRejectionReason('');

      // Show success message
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error rejecting submission:', error);
      setError(error instanceof Error ? error.message : 'Failed to reject submission');
      HapticService.subtle();
    }
  };

  const handleDelete = async (submission: Submission) => {
    if (!fid) return;

    if (
      !window.confirm(`Are you sure you want to delete this submission? This cannot be undone.`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${submission.id}?fid=${fid}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete submission');
      }

      HapticService.medium();

      // Update local state
      setSubmissions(prev => prev.filter(s => s.id !== submission.id));
      setPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));

      // Show success message
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error deleting submission:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete submission');
      HapticService.subtle();
    }
  };

  if (!fid) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg shadow-xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Admin: Topic Moderation</h2>
        <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 text-red-400">
          You must be logged in with a Farcaster account to access this admin panel.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-xl max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Admin: Topic Moderation</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            Close
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-300 mr-2">
            Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="text-sm text-gray-400">
          {pagination.totalCount} submission{pagination.totalCount !== 1 ? 's' : ''}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
          No {statusFilter} submissions found.
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {submissions.map(submission => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-800 rounded-lg p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{submission.name}</h3>
                    <div className="flex space-x-4 mb-2">
                      <span className="text-sm text-purple-400">{submission.category.name}</span>
                      <span className="text-sm text-gray-500">FID: {submission.fid}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {statusFilter === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(submission)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(submission)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {statusFilter !== 'pending' && (
                    <button
                      onClick={() => handleDelete(submission)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="mt-4 flex space-x-4 text-sm">
                  <div className="flex-1 bg-gray-900 p-3 rounded">
                    <div className="font-medium text-gray-400 mb-1">Option A</div>
                    <div className="text-white">{submission.optionA}</div>
                  </div>
                  <div className="flex-1 bg-gray-900 p-3 rounded">
                    <div className="font-medium text-gray-400 mb-1">Option B</div>
                    <div className="text-white">{submission.optionB}</div>
                  </div>
                </div>

                {submission.status === 'rejected' && submission.reason && (
                  <div className="mt-3 text-sm bg-red-900/20 border border-red-800/30 p-3 rounded">
                    <div className="font-medium text-red-400 mb-1">Rejection Reason:</div>
                    <div className="text-gray-300">{submission.reason}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded ${
                  pagination.page === 1
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Previous
              </button>

              <div className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-3 py-1 rounded ${
                  pagination.page === pagination.totalPages
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-white mb-4">Reject Submission</h3>

            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                You are rejecting the submission:{' '}
                <span className="font-semibold">{selectedSubmission.name}</span>
              </p>

              <label className="block text-sm font-medium text-gray-300 mb-1">
                Reason for rejection:
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Please provide a reason for rejection..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmReject}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubmissionModeration;
