import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, Star, Eye, MessageSquare, Heart, Activity, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const CATEGORIES = ['General', 'Style Guide', 'Trend Report', 'News', 'Lifestyle'];

const AdminBlogs = ({ token }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({});

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await apiService.adminGet(`blogs/?search=${search}&category=${category}&status=${status}&page=${page}&limit=10`);
      if (res.error) throw new Error(res.error);
      setBlogs(res.data?.results || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, [page, search, category, status]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      const res = await apiService.adminDelete(`blogs/${id}/`);
      if (res.error) throw new Error(res.error);
      toast.success('Blog deleted');
      fetchBlogs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggle = async (id, field, value) => {
    try {
      const res = await apiService.adminPut(`blogs/${id}/`, { [field]: value });
      if (res.error) throw new Error(res.error);
      toast.success('Updated successfully');
      fetchBlogs(); // Refetch to get updated timestamp if needed
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await apiService.adminPut(`blogs/bulk-action/`, { ids: selectedIds, action });
      if (res.error) throw new Error(res.error);
      toast.success('Action applied successfully');
      setSelectedIds([]);
      fetchBlogs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === 'create' 
        ? `blogs/`
        : `blogs/${formData.id}/`;
      
      const res = modalMode === 'create' 
        ? await apiService.adminPost(url, formData)
        : await apiService.adminPut(url, formData);
      
      if (res.error) {
        throw new Error(res.error || 'Failed to save');
      }
      
      toast.success(`Blog ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openCreate = () => {
    setFormData({ title: '', slug: '', author: 'Admin', content: '', excerpt: '', category: 'General', cover_image_url: '', is_published: false, is_trending: false, is_featured: false });
    setModalMode('create');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-4 flex-1 flex-wrap">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" placeholder="Search blogs..." 
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <select 
            value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white min-w-[150px]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="unpublished">Pending Review (Draft)</option>
          </select>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
          <Plus className="w-5 h-5" /> Create Blog
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
          <span className="text-blue-800 font-medium">{selectedIds.length} blogs selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('publish')} className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-50">Publish</button>
            <button onClick={() => handleBulkAction('unpublish')} className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-50">Unpublish</button>
            <button onClick={() => handleBulkAction('mark_trending')} className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-50">Mark Trending</button>
            <button onClick={() => handleBulkAction('mark_featured')} className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-50">Mark Featured</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-4 w-12"><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? blogs.map(b => b.id) : [])} checked={blogs.length > 0 && selectedIds.length === blogs.length} /></th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Title & Author</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm text-center">Toggles</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm text-center">Metrics</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="py-8 text-center">Loading...</td></tr> : blogs.map(b => (
              <tr key={b.id} className="hover:bg-gray-50/50">
                <td className="py-3 px-4"><input type="checkbox" checked={selectedIds.includes(b.id)} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, b.id] : prev.filter(id => id !== b.id))} /></td>
                <td className="py-3 px-4">
                  <div className="font-medium line-clamp-1">{b.title}</div>
                  <div className="text-sm text-gray-500">{b.category} • by {b.author}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${b.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {b.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-3">
                    <button title="Trending" onClick={() => handleToggle(b.id, 'is_trending', !b.is_trending)}>
                      <Activity className={`w-5 h-5 ${b.is_trending ? 'text-red-500' : 'text-gray-300'}`} />
                    </button>
                    <button title="Featured" onClick={() => handleToggle(b.id, 'is_featured', !b.is_featured)}>
                      <Star className={`w-5 h-5 ${b.is_featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1" title="Views"><Eye className="w-3 h-3" /> {b.views_count}</span>
                    <span className="flex items-center gap-1" title="Likes"><Heart className="w-3 h-3" /> {b.likes_count}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2 items-center">
                    {!b.is_published && (
                      <button onClick={() => handleToggle(b.id, 'is_published', true)} className="px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-medium" title="Approve & Publish">Approve</button>
                    )}
                    <Link to={`/trending/${b.slug}`} target="_blank" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="View Blog">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button onClick={() => { setFormData(b); setModalMode('edit'); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit Blog"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject / Delete Blog"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border">Prev</button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border">Next</button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{modalMode === 'create' ? 'Create Blog' : 'Edit Blog'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author *</label>
                  <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Excerpt</label>
                  <textarea rows={2} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full px-3 py-2 border rounded"></textarea>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Content (Markdown) *</label>
                  <textarea rows={10} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-3 py-2 border rounded font-mono text-sm" required></textarea>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Cover Image URL</label>
                  <input type="url" value={formData.cover_image_url} onChange={e => setFormData({...formData, cover_image_url: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="col-span-2 flex gap-6 mt-2">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} /> Published</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_trending} onChange={e => setFormData({...formData, is_trending: e.target.checked})} /> Trending</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} /> Featured</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">Save Blog</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
