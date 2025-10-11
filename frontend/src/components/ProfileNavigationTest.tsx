import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Test component to verify profile navigation works correctly
 * This component can be temporarily added to test navigation flows
 */
export const ProfileNavigationTest: React.FC = () => {
  const navigate = useNavigate();

  const testUsers = [
    { id: 1, name: 'John Doe', username: 'johndoe' },
    { id: 2, name: 'Jane Smith', username: 'janesmith' },
    { id: 3, name: 'Bob Johnson', username: 'bobjohnson' }
  ];

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Profile Navigation Test</h3>
      <div className="space-y-2">
        {testUsers.map(user => (
          <button
            key={user.id}
            onClick={() => navigate(`/profile/${user.id}`)}
            className="block w-full text-left p-3 bg-white rounded border hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-600">@{user.username}</div>
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Click on any user above to test navigation to their profile page.</p>
        <p>Expected behavior:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Navigate to /profile/{'{userId}'}</li>
          <li>Display user profile with all sections</li>
          <li>Show social stats and connections</li>
          <li>Enable follow/unfollow and friend request actions</li>
        </ul>
      </div>
    </div>
  );
};
