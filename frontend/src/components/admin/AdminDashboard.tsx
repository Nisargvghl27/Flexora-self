import { useState, useEffect } from 'react';
import { Users, Package, FileText, Heart, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { apiService } from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState({
    sales: [],
    users: [],
    popularProducts: [],
    blogStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch base stats
        const statsRes = await apiService.adminGet('stats/');
        if (statsRes.error) throw new Error(statsRes.error);
        const statsData = statsRes.data;
        
        // Fetch analytics concurrently
        const [salesRes, usersRes, productsRes, blogsRes] = await Promise.all([
          apiService.adminGet('analytics/sales/'),
          apiService.adminGet('analytics/users/'),
          apiService.adminGet('analytics/popular-products/'),
          apiService.adminGet('analytics/blog-stats/')
        ]);
        
        const sales = !salesRes.error ? salesRes.data : [];
        const users = !usersRes.error ? usersRes.data : [];
        const popularProducts = !productsRes.error ? productsRes.data : [];
        const blogStats = !blogsRes.error ? blogsRes.data : [];
        
        setStats(statsData);
        setAnalytics({ sales, users, popularProducts, blogStats });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) return <div className="flex h-96 items-center justify-center text-muted-foreground">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">Error: {error}</div>;
  if (!stats) return null;

  const statCards = [
    { title: 'Total Users', value: stats.counts.users, icon: Users, color: 'bg-blue-500' },
    { title: 'Products', value: stats.counts.products, icon: Package, color: 'bg-green-500' },
    { title: 'Blog Posts', value: stats.counts.blogs, icon: FileText, color: 'bg-purple-500' },
    { title: 'Community Members', value: stats.counts.community_members, icon: Heart, color: 'bg-pink-500' },
  ];

  // Process pie chart data (group by category)
  const categoryData = analytics.popularProducts.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.total_quantity;
    } else {
      acc.push({ name: curr.category || 'Uncategorized', value: curr.total_quantity });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card rounded-xl shadow-sm border border-border p-6 flex items-center gap-4">
              <div className={`${stat.color} p-4 rounded-lg text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Sales Over Time (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.sales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_sales" name="Sales (â‚¹)" stroke="#00C49F" strokeWidth={2} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Registrations Chart */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">New Users (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.users}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" name="New Registrations" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Orders by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Blogs */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Top Blogs by Views</h3>
          <div className="space-y-4">
            {analytics.blogStats.map((blog, idx) => (
              <div key={blog.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="font-medium text-foreground line-clamp-1 max-w-[200px]">{blog.title}</p>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> {blog.views_count}</span>
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {blog.likes_count}</span>
                </div>
              </div>
            ))}
            {analytics.blogStats.length === 0 && (
              <div className="text-center text-muted-foreground py-8">No blog data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
