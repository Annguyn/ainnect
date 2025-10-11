import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchService, SearchResult } from '../services/searchService';
import { Button, Input } from '../components/ui';
import { UserProfileCard } from '../components/UserProfileCard';
import { Post, User, Media } from '../types';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { Header } from '../components/Header';
import { 
  Search, 
  Users, 
  MessageSquare, 
  Hash, 
  Filter,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal
} from 'lucide-react';


const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([]);
  
  interface Group {
    id: number;
    name: string;
    description?: string;
    avatarUrl?: string;
    memberCount?: number;
    isPublic?: boolean;
  }

  interface SearchUser extends User {
    friend?: boolean;
    following?: boolean;
    blocked?: boolean;
  }

  interface SearchResults {
    posts: Post[];
    users: SearchUser[];
    groups: Group[];
  }

  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'groups' | 'posts'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'popularity'>('relevance');

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Mock trending keywords
    setTrendingKeywords(['React', 'JavaScript', 'Design', 'Technology', 'Innovation']);
  }, []);

  // Read keyword from URL and auto-run search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('keyword') || '';
    if (q && q !== keyword) {
      setKeyword(q);
      // trigger search for 'all' by default when coming from header
      (async () => {
        setIsLoading(true);
        try {
          const response = await searchService.searchAll(q);
          const users = (response?.data?.users || []).map((user: any) => ({
            id: user.id,
            username: user.username || user.name || 'Unknown',
            displayName: user.displayName || user.name || 'Unknown',
            avatarUrl: user.avatarUrl,
            email: user.email || '',
            isActive: typeof user.isActive === 'boolean' ? user.isActive : true,
            friend: user.friend || false,
            following: user.following || false,
            blocked: user.blocked || false,
            bio: user.bio
          }));
          const posts = response?.data?.posts || [];
          setResults({ posts, users, groups: [] });
          // add to recent
          const next = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
          setRecentSearches(next);
          localStorage.setItem('recentSearches', JSON.stringify(next));
        } catch (err) {
          console.error('Header search error:', err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    // Add to recent searches
    const newRecentSearches = [keyword, ...recentSearches.filter(s => s !== keyword)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    setIsLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'users':
          response = await searchService.searchUsers(keyword);
          break;
        case 'groups':
          response = await searchService.searchGroups(keyword);
          break;
        case 'posts':
          response = await searchService.searchPosts(keyword);
          break;
        default:
          response = await searchService.searchAll(keyword);
          console.log('Search performed with keyword:', keyword, 'on tab:', activeTab);
          console.log('Search response:', response);
      }
      // Handle different response structures based on search type
      let posts: Post[] = [];
      let users: User[] = [];
      let groups: Group[] = [];

      if (activeTab === 'all') {
        // For 'all' search, response has data.posts, data.users, data.groups
        posts = (response.data?.posts || []).map((post: any) => ({
          id: post.id,
          content: post.content || '',
          authorId: post.authorId || 0,
          authorUsername: post.authorUsername || 'Unknown',
          authorDisplayName: post.authorDisplayName || 'Unknown',
          authorAvatarUrl: post.authorAvatarUrl || '',
          visibility: (post.visibility as 'public_' | 'friends' | 'private') || 'public_',
          commentCount: post.commentCount || 0,
          reactionCount: post.reactionCount || 0,
          shareCount: post.shareCount || 0,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt ? post.updatedAt.toString() : post.createdAt.toString(),
          media: (post.mediaUrls || []).map((url: string, index: number) => ({
            id: index,
            mediaUrl: url,
            mediaType: 'image' as 'image',
            createdAt: post.createdAt,
          })) || [],
        }));

        users = (response.data?.users || []).map((user: any) => ({
          id: user.id,
          username: user.username || user.name || 'Unknown',
          displayName: user.displayName || user.name || 'Unknown',
          email: user.email || 'unknown@example.com',
          isActive: true,
          avatarUrl: user.avatarUrl || '',
          bio: user.bio || '',
          createdAt: user.createdAt,
          friend: user.friend || false,
          following: user.following || false,
          blocked: user.blocked || false,
        }));

        groups = (response.data?.groups || []).map((group: any) => ({
          id: group.id,
          name: group.name || 'Unknown',
          description: group.description || group.content || '',
          avatarUrl: group.avatarUrl || '',
        }));
      } else {
        // For specific search types, response has content array
        const content = response.content || [];
        
        posts = content
          .filter((item: any) => item.type === 'post')
          .map((post: any) => ({
            id: post.id,
            content: post.content || '',
            authorId: post.authorId || 0,
            authorUsername: post.authorUsername || 'Unknown',
            authorDisplayName: post.authorDisplayName || 'Unknown',
            authorAvatarUrl: post.authorAvatarUrl || '',
            visibility: (post.visibility as 'public_' | 'friends' | 'private') || 'public_',
            commentCount: post.commentCount || 0,
            reactionCount: post.reactionCount || 0,
            shareCount: post.shareCount || 0,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt ? post.updatedAt.toString() : post.createdAt.toString(),
            media: (post.mediaUrls || []).map((url: string, index: number) => ({
              id: index,
              mediaUrl: url,
              mediaType: 'image' as 'image',
              createdAt: post.createdAt,
            })) || [],
          }));

        users = content
          .filter((item: any) => item.type === 'user')
          .map((user: any) => ({
            id: user.id,
            username: user.username || user.name || 'Unknown',
            displayName: user.displayName || user.name || 'Unknown',
            email: user.email || 'unknown@example.com',
            isActive: true,
            avatarUrl: user.avatarUrl || '',
            bio: user.bio || '',
            createdAt: user.createdAt,
            friend: user.friend || false,
            following: user.following || false,
            blocked: user.blocked || false,
          }));

        groups = content
          .filter((item: any) => item.type === 'group')
          .map((group: any) => ({
            id: group.id,
            name: group.name || 'Unknown',
            description: group.description || group.content || '',
            avatarUrl: group.avatarUrl || '',
          }));
      }

      setResults({ posts, users, groups });
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'all': return <Search className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'groups': return <Hash className="w-4 h-4" />;
      case 'posts': return <MessageSquare className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTabCount = (tab: string) => {
    if (!results) return 0;
    switch (tab) {
      case 'all': return (results.posts?.length || 0) + (results.users?.length || 0) + (results.groups?.length || 0);
      case 'users': return results.users?.length || 0;
      case 'groups': return results.groups?.length || 0;
      case 'posts': return results.posts?.length || 0;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={true} />

      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">
            Find people, posts, and groups on our platform
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for posts, users, groups..."
              className="w-full pl-12 pr-32 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <Button 
                onClick={handleSearch} 
                isLoading={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Searching...' : 'Search'}
          </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
              </button>
              
              {showFilters && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
              )}
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && !results && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Recent:</span>
                <div className="flex space-x-2">
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setKeyword(search)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trending Keywords */}
        {!results && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Trending Now</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingKeywords.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => setKeyword(keyword)}
                  className="px-3 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  #{keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
            <div className="flex space-x-1">
          {['all', 'users', 'groups', 'posts'].map((tab) => (
            <button
              key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {getTabIcon(tab)}
                  <span className="capitalize">{tab}</span>
                  {getTabCount(tab) > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {getTabCount(tab)}
                    </span>
                  )}
            </button>
          ))}
        </div>
          </div>
        )}

        {/* Results Section */}
        <div className="space-y-6">
          {results ? (
            <>
          {/* Posts Section */}
              {results.posts && results.posts.length > 0 && (activeTab === 'all' || activeTab === 'posts') && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Posts</h2>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {results.posts.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                {results.posts.map((post: Post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      ...post,
                      visibility: post.visibility as 'public_' | 'friends' | 'private',
                    }}
                    highlight={keyword}
                    onReaction={() => {}}
                    onUnreact={() => {}}
                    onComment={async () => {}}
                    onShare={() => {}}
                  />
                ))}
                    </div>
                  </div>
            </div>
          )}

          {/* Users Section */}
              {results.users && results.users.length > 0 && (activeTab === 'all' || activeTab === 'users') && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-green-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {results.users.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {results.users.map((user: SearchUser) => (
                        <div 
                    key={user.id}
                          className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/profile/${user.id}`)}
                        >
                          <div className="flex-shrink-0">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.displayName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-semibold text-lg">
                                  {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {user.displayName || user.username}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              @{user.username}
                            </p>
                            {user.bio && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {user.bio}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                              {user.friend ? 'Friends' : user.following ? 'Following' : 'Follow'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
            </div>
          )}

          {/* Groups Section */}
              {results.groups && results.groups.length > 0 && (activeTab === 'all' || activeTab === 'groups') && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Hash className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Groups</h2>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                        {results.groups.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                {results.groups.map((group: Group) => (
                        <div key={group.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-shrink-0">
                            {group.avatarUrl ? (
                              <img
                                src={group.avatarUrl}
                                alt={group.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {group.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {group.name}
                            </h3>
                            {group.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {group.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1 text-gray-500">
                                <Users className="w-4 h-4" />
                                <span className="text-sm">{group.memberCount || 0} members</span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-500">
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">{group.isPublic ? 'Public' : 'Private'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                              Join
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
            </div>
          )}

          {/* Empty State */}
              {(!results.posts?.length && !results.users?.length && !results.groups?.length) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">Try searching with different keywords or check your spelling</p>
                  <button
                    onClick={() => setResults(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Welcome State */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Discover amazing content, connect with interesting people, and explore vibrant communities
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;