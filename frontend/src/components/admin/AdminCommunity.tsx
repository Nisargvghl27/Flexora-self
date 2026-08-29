import { useState, useEffect } from 'react';
import { Search, Download, Trash2, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

const AdminCommunity = ({ token }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewMember, setViewMember] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/admin/community/?search=${search}&page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch community members');
      const data = await res.json();
      setMembers(data.results);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this community member?')) return;
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/admin/community/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete member');
      toast.success('Member removed');
      setViewMember(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/admin/community/export/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export CSV');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'community_members.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('CSV Exported successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" placeholder="Search members by name or email..." 
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
          <Download className="w-5 h-5" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Member Info</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Interest</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm text-center">Newsletter</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Joined</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={5} className="py-8 text-center">Loading...</td></tr> : members.map(m => (
              <tr key={m.id} className="hover:bg-gray-50/50">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{m.name}</div>
                  <div className="text-sm text-gray-500">{m.email}</div>
                  <div className="text-xs text-gray-400">@{m.username}</div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{m.fashion_interest || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${m.subscribe_newsletter ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {m.subscribe_newsletter ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setViewMember(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View details"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Remove member"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border">Prev</button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border">Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {viewMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold">{viewMember.name}</h3>
                <p className="text-sm text-gray-500">@{viewMember.username}</p>
              </div>
              <button onClick={() => setViewMember(null)}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div><span className="text-gray-500 block">Email</span><span className="font-medium">{viewMember.email}</span></div>
                <div><span className="text-gray-500 block">Phone</span><span className="font-medium">{viewMember.phone || '-'}</span></div>
                <div><span className="text-gray-500 block">Location</span><span className="font-medium">{viewMember.location || '-'}</span></div>
                <div><span className="text-gray-500 block">Joined</span><span className="font-medium">{new Date(viewMember.created_at).toLocaleDateString()}</span></div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 block mb-1">Fashion Interest</span>
                  <p className="bg-gray-50 p-2 rounded border">{viewMember.fashion_interest || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">What brings them here</span>
                  <p className="bg-gray-50 p-2 rounded border">{viewMember.what_brings_you_here || 'Not specified'}</p>
                </div>
                {viewMember.bio && (
                  <div>
                    <span className="text-gray-500 block mb-1">Bio</span>
                    <p className="bg-gray-50 p-2 rounded border">{viewMember.bio}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div><span className="text-gray-500 block">Instagram</span><span className="text-blue-600">{viewMember.instagram_handle || '-'}</span></div>
                <div><span className="text-gray-500 block">Website</span><span className="text-blue-600 truncate block">{viewMember.personal_website || '-'}</span></div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50 rounded-b-xl">
              <button onClick={() => handleDelete(viewMember.id)} className="text-red-600 hover:text-red-800 px-3 py-2 text-sm font-medium">Remove Member</button>
              <button onClick={() => setViewMember(null)} className="bg-white border shadow-sm px-4 py-2 rounded-lg text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommunity;
