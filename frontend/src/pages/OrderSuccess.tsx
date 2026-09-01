import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { orderId?: string } | null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 border border-border rounded-xl shadow-sm bg-card">
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Confirmed!</h1>
        
        <p className="text-muted-foreground">
          Thank you for your purchase. We've received your order and will begin processing it right away.
        </p>

        {state?.orderId && (
          <div className="bg-muted/50 p-6 rounded-lg border border-border text-left">
            <p className="text-sm font-medium text-muted-foreground mb-1">Order Reference</p>
            <p className="text-lg font-mono font-bold text-foreground mb-4">{state.orderId}</p>
            
            {(() => {
              try {
                const username = localStorage.getItem('username');
                const ordersKey = username ? `flexora_orders_${username}` : 'flexora_orders_guest'; // Assuming guest uses 'flexora_orders_undefined' or similar, we fallback if needed. But in Cart.tsx it saves if user.username exists.
                // Wait, Cart.tsx only saves if user.username exists:
                // const orders = getStorageData(STORAGE_KEYS.ORDERS, user.username, []);
                const ordersStr = localStorage.getItem(username ? `flexora_orders_${username}` : 'flexora_orders_undefined');
                if (ordersStr) {
                  const orders = JSON.parse(ordersStr);
                  const order = orders.find((o: any) => o.id === state.orderId);
                  if (order) {
                    return (
                      <div className="mt-4 border-t border-border/50 pt-4">
                        <p className="font-semibold mb-2 text-foreground">Order Summary</p>
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-2">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-muted-foreground truncate pr-4">{item.quantity}x {item.name}</span>
                              <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between border-t border-border/50 pt-2 font-bold text-foreground">
                          <span>Total</span>
                          <span>₹{order.total}</span>
                        </div>
                      </div>
                    );
                  }
                }
              } catch (e) {
                console.error(e);
              }
              return null;
            })()}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => navigate('/past-orders')}
          >
            View Orders
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
