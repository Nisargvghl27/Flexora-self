import { useState, useEffect } from 'react';
import { Search, Eye, Edit, CheckCircle, Package, Truck, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  shipped: Truck,
  delivered: Package,
  cancelled: XCircle
};

const AdminOrders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiService.adminGet(`orders/?search=${search}&page=${page}&limit=10`);
      if (res.error) throw new Error(res.error);
      setOrders(res.data?.results || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, search]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await apiService.adminPut(`orders/${id}/status/`, { status: newStatus });
      if (res.error) throw new Error(res.error);
      toast.success('Order status updated');
      
      // Update local state
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      setOrderDetailsLoading(true);
      setIsModalOpen(true);
      
      const res = await apiService.adminGet(`orders/${orderId}/`);
      
      if (res.error) throw new Error(res.error);
      const data = res.data;
      
      setSelectedOrder(data);
      setOrderItems(data?.items || []);
    } catch (err) {
      toast.error(err.message);
      setIsModalOpen(false);
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" placeholder="Search order ID or customer..." 
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm">Order ID</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm">Customer</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm">Date</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm">Amount</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm">Status</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No orders found</td></tr>
            ) : (
              orders.map(o => {
                const StatusIcon = STATUS_ICONS[o.status] || Clock;
                return (
                  <tr key={o.id} className="hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium text-foreground text-sm">{o.id}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{o.username}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">${o.total_amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{o.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <select 
                          value={o.status}
                          onChange={e => handleStatusUpdate(o.id, e.target.value)}
                          className="text-xs border border-border rounded px-2 py-1 bg-card focus:outline-none focus:border-primary"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button onClick={() => openOrderDetails(o.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-border disabled:opacity-50">Prev</button>
          <span className="px-3 py-1 text-muted-foreground">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-border disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
              <h3 className="text-xl font-bold">Order Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-muted-foreground">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {orderDetailsLoading || !selectedOrder ? (
                <div className="py-12 text-center text-muted-foreground">Loading details...</div>
              ) : (
                <div className="space-y-8">
                  {/* Summary Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 bg-muted p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-semibold text-foreground">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-semibold text-foreground">${selectedOrder.total_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${STATUS_COLORS[selectedOrder.status]}`}>
                        <span className="capitalize">{selectedOrder.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 border-b pb-2">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground w-24 inline-block">Username:</span> <span className="font-medium">{selectedOrder.user.username}</span></p>
                        <p><span className="text-muted-foreground w-24 inline-block">Email:</span> <span className="font-medium">{selectedOrder.user.email}</span></p>
                        <p><span className="text-muted-foreground w-24 inline-block">Phone:</span> <span className="font-medium">{selectedOrder.shipping_phone || 'N/A'}</span></p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 border-b pb-2">Shipping Address</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="font-medium">{selectedOrder.shipping_name}</p>
                        <p>{selectedOrder.shipping_address}</p>
                        <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_pincode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 border-b pb-2">Order Items</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-muted-foreground">
                          <tr>
                            <th className="py-3 px-4 font-medium">Product</th>
                            <th className="py-3 px-4 font-medium">Details</th>
                            <th className="py-3 px-4 font-medium text-center">Qty</th>
                            <th className="py-3 px-4 font-medium text-right">Price</th>
                            <th className="py-3 px-4 font-medium text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orderItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium text-foreground">{item.product_name}</td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {item.size && <span className="mr-2">Size: {item.size}</span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </td>
                              <td className="py-3 px-4 text-center">{item.quantity}</td>
                              <td className="py-3 px-4 text-right">${item.product_price.toFixed(2)}</td>
                              <td className="py-3 px-4 text-right font-medium">${(item.quantity * item.product_price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
