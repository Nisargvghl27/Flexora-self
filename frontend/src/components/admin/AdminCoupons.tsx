import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const AdminCoupons = ({ token }: { token: string | null }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
    is_active: true
  });

  const fetchCoupons = async () => {
    try {
      const res = await apiService.adminGet('coupons/');
      if (!res.error && res.data) {
        setCoupons(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const openEditForm = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount.toString(),
      max_uses: coupon.max_uses ? coupon.max_uses.toString() : '',
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '',
      is_active: coupon.is_active
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_uses: '',
      expires_at: '',
      is_active: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      discount_value: parseFloat(formData.discount_value),
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at || null
    };

    const url = editingCoupon 
      ? `coupons/${editingCoupon.id}/` 
      : `coupons/`;

    try {
      const res = editingCoupon 
        ? await apiService.adminPut(url, payload)
        : await apiService.adminPost(url, payload);

      if (!res.error) {
        toast.success(`Coupon ${editingCoupon ? 'updated' : 'created'} successfully`);
        fetchCoupons();
        closeForm();
      } else {
        toast.error(res.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const res = await apiService.adminDelete(`coupons/${id}/`);
        
        if (!res.error) {
          toast.success('Coupon deleted successfully');
          setCoupons(coupons.filter(c => c.id !== id));
        } else {
          toast.error(res.error || 'Failed to delete coupon');
        }
      } catch (error) {
        toast.error('An error occurred');
      }
    }
  };

  if (loading) return <div>Loading coupons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-display">Coupons Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 relative animate-fade-in">
          <button 
            onClick={closeForm}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-accent rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-semibold mb-6">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Coupon Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary uppercase"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Value</label>
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Min. Order Amount (₹)</label>
              <input
                type="number"
                name="min_order_amount"
                value={formData.min_order_amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Uses (Leave blank for unlimited)</label>
              <input
                type="number"
                name="max_uses"
                value={formData.max_uses}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expires At (Optional)</label>
              <input
                type="datetime-local"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium">Is Active</label>
            </div>
            
            <div className="col-span-1 md:col-span-2 pt-4">
              <button 
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full md:w-auto"
              >
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-sm">Code</th>
                <th className="p-4 font-semibold text-sm">Discount</th>
                <th className="p-4 font-semibold text-sm">Min Order</th>
                <th className="p-4 font-semibold text-sm">Uses</th>
                <th className="p-4 font-semibold text-sm">Status</th>
                <th className="p-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-accent/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      {coupon.code}
                    </div>
                  </td>
                  <td className="p-4">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `₹${coupon.discount_value}`}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {coupon.min_order_amount > 0 ? `₹${coupon.min_order_amount}` : 'None'}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {coupon.current_uses} {coupon.max_uses ? `/ ${coupon.max_uses}` : ''}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      coupon.is_active && (!coupon.expires_at || new Date(coupon.expires_at) > new Date())
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditForm(coupon)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No coupons found. Create your first coupon above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
