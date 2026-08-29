import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Check, X, Home, Building, Map } from 'lucide-react';
import { useAuth } from '../App';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';

interface Address {
  id: string;
  name: string;
  type: 'home' | 'work' | 'other';
  address: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  selectedAddress: string;
  onAddressSelect: (address: string) => void;
  onAddressesChange: (addresses: Address[]) => void;
  className?: string;
}

const AddressManager = ({ 
  selectedAddress, 
  onAddressSelect, 
  onAddressesChange,
  className = "" 
}: AddressManagerProps) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    type: 'home' as 'home' | 'work' | 'other',
    address: ''
  });

  useEffect(() => {
    // Load saved addresses from localStorage (username-specific)
    if (!user?.username) return;
    
    const savedAddresses = getStorageData(STORAGE_KEYS.SAVED_ADDRESSES, user.username, []);
    setAddresses(savedAddresses);
  }, [user?.username]);

  useEffect(() => {
    // Save addresses to localStorage whenever they change (username-specific)
    if (!user?.username) return;
    
    setStorageData(STORAGE_KEYS.SAVED_ADDRESSES, addresses, user.username);
    onAddressesChange(addresses);
  }, [addresses, onAddressesChange, user?.username]);

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.address) return;

    const address: Address = {
      id: `addr-${Date.now()}`,
      name: newAddress.name,
      type: newAddress.type,
      address: newAddress.address,
      isDefault: addresses.length === 0 // First address becomes default
    };

    setAddresses(prev => [...prev, address]);
    setNewAddress({ name: '', type: 'home', address: '' });
    setShowAddForm(false);
    
    // Auto-select if it's the first address
    if (addresses.length === 0) {
      onAddressSelect(address.address);
    }
  };

  const handleEditAddress = () => {
    if (!editingAddress || !newAddress.name || !newAddress.address) return;

    setAddresses(prev => prev.map(addr => 
      addr.id === editingAddress.id 
        ? { ...addr, name: newAddress.name, type: newAddress.type, address: newAddress.address }
        : addr
    ));

    // Clear the editing state
    setEditingAddress(null);
    setNewAddress({ name: '', type: 'home', address: '' });
    setShowAddForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleEditClick = (address: Address) => {
    // Set the editing state
    setEditingAddress(address);
    setNewAddress({
      name: address.name,
      type: address.type,
      address: address.address
    });
    setShowAddForm(false); // Ensure add form is hidden
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="h-4 w-4" />;
      case 'work': return <Building className="h-4 w-4" />;
      default: return <Map className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'home': return 'text-blue-600 bg-blue-100';
      case 'work': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Saved Addresses</h3>
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 border rounded-lg transition-all ${
                selectedAddress === address.address
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => onAddressSelect(address.address)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded-full ${getTypeColor(address.type)}`}>
                      {getTypeIcon(address.type)}
                    </div>
                    <span className="font-medium text-gray-900">{address.name}</span>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{address.address}</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    type="button"
                    onClick={() => handleEditClick(address)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit address"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {!address.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Form */}
      {(showAddForm || editingAddress) && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">
              {editingAddress ? `Edit Address: ${editingAddress.name}` : 'Add New Address'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAddress(null);
                setNewAddress({ name: '', type: 'home', address: '' });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Name
              </label>
              <input
                type="text"
                value={newAddress.name}
                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                placeholder="e.g., Home, Work, Grandma's House"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus={editingAddress ? true : false}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Type
              </label>
              <select
                value={newAddress.type}
                onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                placeholder="Enter the full address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={editingAddress ? handleEditAddress : handleAddAddress}
                disabled={!newAddress.name || !newAddress.address}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                  setNewAddress({ name: '', type: 'home', address: '' });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Button */}
      {!showAddForm && !editingAddress && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            <span>Add New Address</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default AddressManager; 