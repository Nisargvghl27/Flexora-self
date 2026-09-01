import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ShoppingBag, X, CheckCircle } from 'lucide-react';
import { toast } from "sonner";
import Suggestions from '../components/Suggestions';
import AddressManager from '../components/AddressManager';
import { useAuth } from '../contexts/AuthContext';
import { getStorageData, setStorageData, removeStorageData, getStorageKey, STORAGE_KEYS } from '../lib/storage';
import { apiService, CartItem } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/ui/skeleton';
import { PageTransition } from '../components/PageTransition';
import { formatPrice } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

// Declare Razorpay interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [form, setForm] = useState({
    name: user?.username || '',
    email: '',
    address: '',
    phone: ''
  });
  
  useEffect(() => {
    if (user?.username && !form.name) {
      setForm(prev => ({ ...prev, name: user.username }));
    }
  }, [user]);

  const [formError, setFormError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountAmount: number} | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      if (user?.username) {
        // Load from API if logged in
        const res = await apiService.getCart();
        if (res.data) {
          // Format API cart items to match expected format in UI
          const formattedCart = res.data.map((item: CartItem) => ({
            ...item.product,
            id: item.id, // the cart_item id
            product_id: item.product_id,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }));
          setCartItems(formattedCart);
        } else {
          setCartItems([]);
        }
      } else {
        // Fallback to localStorage for guests
        const savedCart = getStorageData(STORAGE_KEYS.CART, undefined, []);
        setCartItems(savedCart);
      }
      setIsLoading(false);
    };
    
    loadCart();
  }, [user]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const existingScript = document.getElementById('razorpay-checkout-js');
        if (existingScript) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.id = 'razorpay-checkout-js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          toast.error('Failed to load payment gateway');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  const updateCart = (items: any[]) => {
    setCartItems(items);
    if (!user) {
      setStorageData(STORAGE_KEYS.CART, items);
    }
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleRemove = async (id: string, size?: string, color?: string) => {
    if (user) {
      const res = await apiService.removeCartItem(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const updated = cartItems.filter(item => item.id !== id);
      updateCart(updated);
    } else {
      const updated = cartItems.filter(item => !(item.id === id && item.size === size && item.color === color));
      updateCart(updated);
    }
    toast.success("Product removed from cart!");
  };

  const handleQuantity = async (id: string, currentQuantity: number, delta: number) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    if (user) {
      const res = await apiService.updateCartItem(id, newQuantity);
      if (res.error) {
        toast.error(res.error);
        return;
      }
    }
    
    const updated = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updated);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - (appliedCoupon ? appliedCoupon.discountAmount : 0));

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    
    const res = await apiService.validateCoupon(couponCodeInput.trim(), subtotal);
    if (res.error) {
      toast.error(res.error);
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon({
        code: res.data.coupon_code,
        discountAmount: res.data.discount_amount
      });
      toast.success(res.data.message);
    }
    
    setIsApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const verifyPayment = async (paymentResponse: any, receipt: string) => {
    try {
      const verifyResponse = await apiService.verifyRazorpayPayment({
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        receipt: receipt
      });
      
      if (!verifyResponse.error && verifyResponse.data?.success) {
        handlePaymentSuccess(paymentResponse.razorpay_payment_id, paymentResponse.razorpay_order_id);
      } else {
        throw new Error(verifyResponse.error || verifyResponse.rawErrorData?.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed, Please contact support.');
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string, orderId: string) => {
    // Save the completed order to localStorage (username-specific)
    if (!user?.username) return;
    
    const orders = getStorageData(STORAGE_KEYS.ORDERS, user.username, []);
    const newOrder = {
      id: orderId,
      paymentId: paymentId,
      paymentMethod: paymentMethod,
      items: cartItems,
      total: total,
      customerInfo: form,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    orders.push(newOrder);
    setStorageData(STORAGE_KEYS.ORDERS, orders, user.username);

    // Clear cart and show success
    setCartItems([]);
    if (user) {
      apiService.clearCart();
    } else {
      removeStorageData(STORAGE_KEYS.CART);
    }
    window.dispatchEvent(new Event('cart-updated'));
    
    toast.success('Payment successful! Order placed.');
    setIsProcessingPayment(false);
    navigate('/order-success', { state: { orderId: orderId } });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.email || !form.address || !form.phone) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setFormError('Phone number must be exactly 10 digits.');
      return;
    }

    if (paymentMethod === 'cod') {
      setIsProcessingPayment(true);
      // Simulate brief processing delay
      setTimeout(() => {
        handlePaymentSuccess('COD', `order_cod_${Date.now()}`);
      }, 1000);
      return;
    }


    if (!razorpayLoaded || !window.Razorpay) {
      toast.error('Payment gateway is still loading. Please try again in a moment.');
      setIsProcessingPayment(false);
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Try to create order on backend first, fallback to direct payment if backend is not available
      let orderData = null;
      let useBackend = true;
      
      try {
        const orderResponse = await apiService.createRazorpayOrder({
          amount: total,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          customer_info: form,
          cart_items: cartItems,
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined
        });

        if (!orderResponse.error && orderResponse.data) {
          orderData = orderResponse.data;
        } else {
          throw new Error(orderResponse.error || 'Backend order creation failed');
        }
      } catch (backendError) {
        useBackend = false;
        // Create a mock order for direct payment
        orderData = {
          id: `order_${Date.now()}`,
          amount: Math.round(total * 100), // Convert to paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        };
      }

      // Razorpay options
      const options = {
        key: 'rzp_test_uWnvz5ddtLEob6', // Your Razorpay key ID
        amount: orderData.amount, // Amount in paise
        currency: orderData.currency,
        name: 'Flexora',
        description: 'Purchase from Flexora',
        order_id: useBackend ? orderData.id : undefined, // Only use order_id if created via backend
        handler: async function (response: any) {
          if (useBackend) {
            await verifyPayment(response, orderData.receipt);
          } else {
            // Direct success handling without backend verification
            handlePaymentSuccess(response.razorpay_payment_id, response.razorpay_order_id || orderData.id);
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        notes: {
          address: form.address,
          items_count: cartItems.length
        },
        theme: {
          color: '#8B5CF6' // Purple theme to match your site
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <PageTransition>
      <Navigation />
      <main className="w-full bg-muted/30 min-h-screen pb-16">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            <h1 className="text-4xl font-bold mb-10 text-foreground font-display">Your Cart</h1>
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-6 p-6 border rounded-xl">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-24 mt-4" />
                    </div>
                  </div>
                ))}
                <div className="border rounded-xl p-6 mt-8">
                  <Skeleton className="h-6 w-1/4 mb-4" />
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-12 w-full md:w-48 ml-auto" />
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="animate-fade-in">
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  description="Browse products and add your favorite items to your cart."
                  actionLabel="Start shopping"
                  actionLink="/products"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column: Cart Items */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                {cartItems.map(item => (
                  <div key={item.id + (item.size || '') + (item.color || '')} className="flex items-center gap-6 bg-card rounded-xl p-6 border border-border">
                    <div className="w-24 h-24 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/30 overflow-hidden">
                      <img
                        src={item.image_url || '/placeholder.svg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-foreground">{item.name}</h2>
                          <div className="text-sm text-muted-foreground">{item.category}</div>
                          {item.size && <div className="text-xs text-muted-foreground">Size: {item.size}</div>}
                          {item.color && <div className="text-xs text-muted-foreground">Color: {item.color}</div>}
                        </div>
                        <button onClick={() => handleRemove(item.id, item.size, item.color)} className="p-2 hover:bg-accent rounded-full transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="font-medium text-primary">{formatPrice(item.price)}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleQuantity(item.id, item.quantity, -1)} className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-accent transition-colors">-</button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button onClick={() => handleQuantity(item.id, item.quantity, 1)} className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-accent transition-colors">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>

                {/* Right Column: Summary & Checkout */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                  {/* Cart Summary */}
                  <div className="bg-card rounded-2xl p-6 border border-border shadow-sm sticky top-24">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Coupon Section */}
                      <div className="max-w-md">
                        <label className="block text-sm font-medium mb-2">Have a coupon?</label>
                        {!appliedCoupon ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCodeInput}
                              onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="flex-1 px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                              onClick={handleApplyCoupon}
                              disabled={isApplyingCoupon || !couponCodeInput}
                              className="px-6 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {isApplyingCoupon ? 'Applying...' : 'Apply'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-medium">{appliedCoupon.code} applied â€” â‚¹{appliedCoupon.discountAmount} off!</span>
                            </div>
                            <button onClick={removeCoupon} className="text-green-700 hover:text-green-900">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between text-muted-foreground mb-2">
                          <span>Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-green-600 mb-2 font-medium">
                            <span>Discount ({appliedCoupon.code})</span>
                            <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-foreground mt-4">
                          <span>Total:</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">Shipping and taxes calculated at checkout.</div>
                      </div>
                    </div>
                    {!showCheckout && (
                      <button
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-lg mt-6"
                        onClick={() => setShowCheckout(true)}
                      >
                        Proceed to Checkout
                      </button>
                    )}
                  </div>
                </div>
                  
                {/* Checkout Form */}
                {showCheckout && (
                  <form onSubmit={handleCheckout} className="bg-card rounded-xl p-6 border border-border mt-8 space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Checkout</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-foreground">Address</label>
                          <button
                            type="button"
                            onClick={() => setShowAddressManager(!showAddressManager)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {showAddressManager ? 'Hide Saved Addresses' : 'Use Saved Addresses'}
                          </button>
                        </div>
                        
                        {showAddressManager ? (
                          <AddressManager
                            selectedAddress={form.address}
                            onAddressSelect={(address) => setForm({ ...form, address })}
                            onAddressesChange={() => {}}
                            className="mb-4"
                          />
                        ) : (
                          <>
                            <Suggestions
                              value={form.address}
                              onChange={(address) => setForm({ ...form, address })}
                              placeholder="Start typing your address for suggestions..."
                              className="w-full"
                              type="address"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Type at least 3 characters to see address suggestions
                            </p>
                          </>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                          pattern="\d{10}"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <label className="block text-sm font-medium text-foreground mb-3">Payment Method</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="online" 
                            checked={paymentMethod === 'online'} 
                            onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cod')}
                            className="sr-only" 
                          />
                          <span className="font-medium">Online Payment</span>
                          <span className="text-xs text-muted-foreground text-center">Credit Card, UPI, Net Banking</span>
                        </label>
                        <label className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="cod" 
                            checked={paymentMethod === 'cod'} 
                            onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cod')}
                            className="sr-only" 
                          />
                          <span className="font-medium">Cash on Delivery</span>
                          <span className="text-xs text-muted-foreground text-center">Pay when your order arrives</span>
                        </label>
                      </div>
                    </div>
                    
                    {formError && <div className="text-red-500 text-sm text-center">{formError}</div>}
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingPayment ? 'Processing...' : 'Place Order'}
                    </button>
                  </form>
                )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Cart; 
