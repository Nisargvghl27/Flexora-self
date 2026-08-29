import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ShoppingBag, X, CheckCircle } from 'lucide-react';
import { toast } from "sonner";
import Suggestions from '../components/Suggestions';
import AddressManager from '../components/AddressManager';
import { useAuth } from '../App';
import { getStorageData, setStorageData, removeStorageData, getStorageKey, STORAGE_KEYS } from '../lib/storage';

// Declare Razorpay interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  const [formError, setFormError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (!user?.username) {
      console.log('Cart: No user username available');
      return;
    }
    
    console.log('Cart: Loading data for user:', user.username);
    const savedCart = getStorageData(STORAGE_KEYS.CART, user.username, []);
    console.log('Cart: Loaded cart data:', savedCart);
    console.log('Cart: Storage key used:', getStorageKey(STORAGE_KEYS.CART, user.username));
    setCartItems(savedCart);
  }, [user?.username]);

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
          console.log('Razorpay script loaded successfully');
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
    if (!user?.username) return;
    
    setCartItems(items);
    setStorageData(STORAGE_KEYS.CART, items, user.username);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleRemove = (id: number, size?: string, color?: string) => {
    const updated = cartItems.filter(item => !(item.id === id && item.size === size && item.color === color));
    updateCart(updated);
    toast.success("Product removed from cart!");
  };

  const handleQuantity = (id: number, delta: number) => {
    const updated = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    updateCart(updated);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const verifyPayment = async (paymentResponse: any, receipt: string) => {
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const verifyResponse = await fetch(`${baseURL}/api/verify-razorpay-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          receipt: receipt
        })
      });

      const text = await verifyResponse.text();
      let verifyData: any = {};
      try { if (text) verifyData = JSON.parse(text); } catch (_) {}
      
      if (verifyResponse.ok && verifyData.success) {
        handlePaymentSuccess(paymentResponse.razorpay_payment_id, paymentResponse.razorpay_order_id);
      } else {
        throw new Error(verifyData.message || 'Payment verification failed');
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
    setCheckoutSuccess(true);
    setCartItems([]);
    removeStorageData(STORAGE_KEYS.CART, user.username);
    window.dispatchEvent(new Event('cart-updated'));
    
    toast.success('Payment successful! Order placed.');
    setIsProcessingPayment(false);
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

    console.log('Starting checkout process...');
    console.log('Razorpay loaded:', razorpayLoaded);
    console.log('Window.Razorpay available:', !!window.Razorpay);
    console.log('Total amount:', total);

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
        const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const orderResponse = await fetch(`${baseURL}/api/create-razorpay-order/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store auth token
          },
          body: JSON.stringify({
            amount: total,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            customer_info: form,
            cart_items: cartItems
          })
        });

        if (orderResponse.ok) {
          const text = await orderResponse.text();
          try { if (text) orderData = JSON.parse(text); } catch (_) {}
          console.log('Order created via backend:', orderData);
        } else {
          throw new Error('Backend order creation failed');
        }
      } catch (backendError) {
        console.log('Backend not available, using direct payment mode:', backendError);
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
          console.log('Payment successful:', response);
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

      console.log('Opening Razorpay with options:', options);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-foreground font-display">Your Cart</h1>
            {checkoutSuccess ? (
              <div className="text-center py-20 animate-fade-in">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-green-600 mb-2">Payment Successful</h3>
                <h4 className="text-2xl font-semibold text-foreground mb-2">Order Placed</h4>
                <p className="text-muted-foreground text-lg max-w-md mx-auto mb-6">Your order has been placed successfully. We will contact you soon.</p>
                <a href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                  Continue Shopping
                </a>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto mb-6">Browse products and add your favorite items to your cart.</p>
                <a href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                </a>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Cart Items */}
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
                        <span className="font-medium text-primary">${item.price}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleQuantity(item.id, -1)} className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-accent transition-colors">-</button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button onClick={() => handleQuantity(item.id, 1)} className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-accent transition-colors">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Cart Summary & Checkout */}
                <div className="bg-card rounded-xl p-6 border border-border mt-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <div className="text-xl font-bold text-foreground">Total: ${total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground mt-1">Shipping and taxes calculated at checkout.</div>
                    </div>
                    <button
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors mt-4 md:mt-0"
                      onClick={() => setShowCheckout(true)}
                    >
                      Proceed to Checkout
                    </button>
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
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cart; 