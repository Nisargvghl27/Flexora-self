import { useState, useEffect } from 'react';
import { Users, Package, FileText, Heart, Activity } from 'lucide-react';

const AdminDashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseURL}/api/admin/stats/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!stats) return null;

  const statCards = [
    { title: 'Total Users', value: stats.counts.users, icon: Users, color: 'bg-blue-500' },
    { title: 'Products', value: stats.counts.products, icon: Package, color: 'bg-green-500' },
    { title: 'Blog Posts', value: stats.counts.blogs, icon: FileText, color: 'bg-purple-500' },
    { title: 'Community Members', value: stats.counts.community_members, icon: Heart, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
              <div className={`${stat.color} p-4 rounded-lg text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Recent Registrations</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recent_users.map(user => (
              <div key={user.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(user.date_joined).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Recent Blogs</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recent_blogs.map(blog => (
              <div key={blog.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 line-clamp-1">{blog.title}</p>
                  <p className="text-sm text-gray-500">by {blog.author}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${blog.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {blog.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
