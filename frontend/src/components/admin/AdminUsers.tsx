import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Shield, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

const AdminUsers = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiService.adminGet(`users/?search=${search}&page=${page}&limit=10`);
      if (res.error) throw new Error(res.error);
      setUsers(res.data.results);
      setTotalPages(res.data.total_pages);
      setTotal(res.data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this user? This cannot be undone.')) return;
    try {
      const res = await apiService.adminDelete(`users/${id}/`);
      if (res.error) throw new Error(res.error);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.adminPut(`users/${editingUser.id}/`, {
        username: editingUser.username,
        email: editingUser.email,
        is_active: editingUser.is_active,
        is_staff: editingUser.is_staff,
        is_superuser: editingUser.is_superuser
      });
      if (res.error) throw new Error(res.error);
      
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search username or email..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="text-sm text-muted-foreground self-end sm:self-center">
          Total Users: <span className="font-bold text-foreground">{total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm">Username</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm">Email</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm">Joined</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm text-center">Active</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm text-center">Role</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">No users found</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{user.username}</td>
                  <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center">
                    {user.is_active ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {user.is_superuser ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <ShieldAlert className="w-3 h-3" /> Superuser
                      </span>
                    ) : user.is_staff ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3" /> Staff
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">User</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingUser(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 rounded border border-border disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-muted-foreground">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 rounded border border-border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
                <input 
                  type="text" 
                  value={editingUser.username}
                  onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary"
                  required
                />
              </div>
              
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingUser.is_active}
                    onChange={e => setEditingUser({...editingUser, is_active: e.target.checked})}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Active Account</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingUser.is_staff}
                    onChange={e => setEditingUser({...editingUser, is_staff: e.target.checked})}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Staff Member</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-red-600">
                  <input 
                    type="checkbox" 
                    checked={editingUser.is_superuser}
                    onChange={e => setEditingUser({...editingUser, is_superuser: e.target.checked})}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span>Superuser</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
