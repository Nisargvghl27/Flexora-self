import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, DollarSign, Package, ArrowLeft, Filter, Search, ChevronDown, ChevronUp, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { PageTransition } from '../components/PageTransition';

const PastOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      const res = await apiService.getOrders();
      if (res.data) {
        setOrders(res.data.orders);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, navigate]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];

  const getStatusIndex = (status: string) => {
    return statusSteps.indexOf(status);
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.shipping_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get total spent
  const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <PageTransition>
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Past Orders</h1>
                <p className="text-muted-foreground">View all your order history</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-primary">{orders.length}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Average Order</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${orders.length > 0 ? (totalSpent / orders.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search orders by ID or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Orders</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="animate-fade-in">
              <EmptyState
                icon={Package}
                title="No orders found"
                description={searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filter criteria." : "You haven't placed any orders yet."}
                actionLabel={!searchTerm && statusFilter === 'all' ? "Browse our collection" : "Clear filters"}
                onAction={() => {
                  if (!searchTerm && statusFilter === 'all') {
                    navigate('/products');
                  } else {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const currentStepIndex = getStatusIndex(order.status);
                const isCancelled = order.status === 'cancelled';

                return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">Order #{order.razorpay_order_id || order.id}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">${parseFloat(order.total_amount).toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold ${
                              order.status === 'delivered' 
                                ? 'bg-green-100 text-green-700' 
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Status Stepper */}
                        {!isCancelled && (
                          <div className="my-6">
                            <div className="flex items-center justify-between relative">
                              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full"></div>
                              <div 
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                              ></div>
                              
                              {statusSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                return (
                                  <div key={step} className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                      isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground'
                                    }`}>
                                      {step === 'pending' && <Clock className="w-4 h-4" />}
                                      {step === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                                      {step === 'shipped' && <Truck className="w-4 h-4" />}
                                      {step === 'delivered' && <Package className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-xs font-medium capitalize hidden sm:block ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {isCancelled && (
                          <div className="my-6 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                            <XCircle className="w-6 h-6" />
                            <span className="font-semibold">This order has been cancelled.</span>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4 border-t border-border pt-4">
                          <div>
                            <p className="text-muted-foreground">Customer</p>
                            <p className="font-medium">{order.shipping_name || user?.username}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment ID</p>
                            <p className="font-medium">{order.razorpay_payment_id || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Order Items Preview / Expand */}
                        <div className="border-t border-border pt-4">
                          <button 
                            onClick={() => toggleExpand(order.id)}
                            className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-lg transition-colors"
                          >
                            <div className="font-medium">
                              {order.items.length} Item{order.items.length !== 1 ? 's' : ''}
                            </div>
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-4 space-y-4 px-2">
                              {order.items.map((item: any, itemIndex: number) => (
                                <div key={itemIndex} className="flex items-start justify-between text-sm p-3 bg-accent/30 rounded-lg">
                                  <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/30 rounded-md flex items-center justify-center mt-1">
                                      <Package className="w-6 h-6 text-primary/60" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-foreground">{item.product_name}</p>
                                      <div className="text-muted-foreground mt-1 space-y-1">
                                        <p>Qty: {item.quantity}</p>
                                        {(item.size || item.color) && (
                                          <p>
                                            {item.size && `Size: ${item.size}`}
                                            {item.size && item.color && ' | '}
                                            {item.color && `Color: ${item.color}`}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right font-medium">
                                    ${(parseFloat(item.product_price) * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default PastOrders; 
