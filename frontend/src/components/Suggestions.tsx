import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, User, X } from 'lucide-react';

interface AddressSuggestion {
  id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface SuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type: 'address' | 'username';
}

const Suggestions = ({ 
  value, 
  onChange, 
  placeholder = "", 
  className = "",
  disabled = false,
  type
}: SuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=us,ca,gb,in,au,de,fr,es,it,nl,se,no,dk,fi,ch,at,be,ie,pt,gr,pl,cz,hu,ro,bg,hr,si,sk,lt,lv,ee,mt,cy,lu&accept-language=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUsernames = async (query: string) => {
    setLoading(true);
    setError('');
    
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${baseURL}/api/usernames/?search=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const text = await response.text();
        let data: any = {};
        try { if (text) data = JSON.parse(text); } catch (_) {}
        setSuggestions(data.usernames || []);
        setShowSuggestions(data.usernames && data.usernames.length > 0);
      } else {
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching username suggestions:', error);
      setError('Network error');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setError('');
    
    if (type === 'address') {
      // Debounce address search
      const timeoutId = setTimeout(() => {
        searchAddresses(newValue);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // Immediate username search
      searchUsernames(newValue);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (type === 'address') {
      const address = formatAddress(suggestion);
      setInputValue(address);
      onChange(address);
    } else {
      setInputValue(suggestion);
      onChange(suggestion);
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const formatAddress = (suggestion: AddressSuggestion): string => {
    const addr = suggestion.address;
    const parts = [];
    
    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road) parts.push(addr.road);
    if (addr.suburb) parts.push(addr.suburb);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.postcode) parts.push(addr.postcode);
    if (addr.country) parts.push(addr.country);
    
    return parts.join(', ');
  };

  const handleFocus = () => {
    if (type === 'username') {
      // Show all usernames when field is focused
      searchUsernames('');
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const clearInput = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const getIcon = () => {
    return type === 'address' ? <MapPin className="h-5 w-5 text-gray-400" /> : <User className="h-5 w-5 text-gray-400" />;
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return type === 'address' ? "Enter your address..." : "Enter username...";
  };

  const renderSuggestion = (suggestion: any, index: number) => {
    if (type === 'address') {
      return (
        <div className="flex items-start">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {suggestion.display_name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatAddress(suggestion)}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">{suggestion}</span>
        </div>
      );
    }
  };

  const getNoResultsMessage = () => {
    const minLength = type === 'address' ? 3 : 2;
    if (inputValue.length >= minLength) {
      return (
        <div className="p-3 text-center text-gray-500">
          <Search className="h-4 w-4 mx-auto mb-1" />
          <p className="text-sm">No {type === 'address' ? 'addresses' : 'usernames'} found</p>
          <p className="text-xs text-gray-400">Try a different search term</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {getIcon()}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute z-20 w-full mt-1 bg-red-50 border border-red-200 rounded-md shadow-lg">
          <div className="p-2 text-center text-red-600 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-3 text-center text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-1 text-sm">Searching {type === 'address' ? 'addresses' : 'usernames'}...</p>
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={type === 'address' ? suggestion.id : index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
            >
              {renderSuggestion(suggestion, index)}
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && !loading && suggestions.length === 0 && getNoResultsMessage() && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {getNoResultsMessage()}
        </div>
      )}
    </div>
  );
};

export default Suggestions; 