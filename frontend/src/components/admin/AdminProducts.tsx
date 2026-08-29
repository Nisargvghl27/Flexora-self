import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, Check, Package } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Minimalist', 'Vintage', 'Streetwear', 'Bohemian', 'Formal', 'Casual'];

const AdminProducts = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/admin/products/?search=${search}&category=${category}&page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search, category]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/admin/products/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleInlineUpdate = async (id, field, value) => {
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/admin/products/${id}/`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Updated successfully');
      setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    } catch (err) {
      toast.error(err.message);
      fetchProducts(); // Revert changes on error
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const url = modalMode === 'create' 
        ? `${baseURL}/api/admin/products/`
        : `${baseURL}/api/admin/products/${formData.id}/`;
      
      const res = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }
      
      toast.success(`Product ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openCreate = () => {
    setFormData({ name: '', price: '', description: '', category: 'Casual', brand: '', stock_quantity: 0, image_url: '', is_active: true });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setFormData({ ...product });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" placeholder="Search products..." 
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <select 
            value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Product</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Category / Brand</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm w-32">Price ($)</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm w-32">Stock</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm text-center">Active</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500">No products found</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                        {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 m-2.5 text-gray-400" />}
                      </div>
                      <span className="font-medium line-clamp-1" title={p.name}>{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div>{p.category}</div>
                    <div className="text-gray-400 text-xs">{p.brand}</div>
                  </td>
                  <td className="py-3 px-4">
                    <input 
                      type="number" step="0.01" value={p.price} 
                      onChange={e => setProducts(products.map(pr => pr.id === p.id ? { ...pr, price: e.target.value } : pr))}
                      onBlur={e => handleInlineUpdate(p.id, 'price', e.target.value)}
                      className="w-24 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-primary rounded bg-transparent focus:bg-white"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input 
                      type="number" value={p.stock_quantity} 
                      onChange={e => setProducts(products.map(pr => pr.id === p.id ? { ...pr, stock_quantity: parseInt(e.target.value) } : pr))}
                      onBlur={e => handleInlineUpdate(p.id, 'stock_quantity', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-primary rounded bg-transparent focus:bg-white"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => handleInlineUpdate(p.id, 'is_active', !p.is_active)} className="focus:outline-none">
                      {p.is_active ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
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
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50">Prev</button>
          <span className="px-3 py-1 text-gray-600">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{modalMode === 'create' ? 'Add New Product' : 'Edit Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded focus:border-primary outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border rounded focus:border-primary outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full px-3 py-2 border rounded focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded focus:border-primary outline-none bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-3 py-2 border rounded focus:border-primary outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-3 py-2 border rounded focus:border-primary outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded focus:border-primary outline-none" required></textarea>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                    <span>Is Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
