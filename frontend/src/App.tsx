import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingAnimation from "./components/LoadingAnimation";
import Home from "./pages/Home";
import TrendingLooks from "./pages/TrendingLooks";
import StyleCategories from "./pages/StyleCategories";
import StudentSpotlights from "./pages/StudentSpotlights";
import Collections from "./pages/Collections";
import Favorites from "./pages/Favorites";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import CategoryProducts from "./pages/CategoryProducts";
import CollectionProducts from "./pages/CollectionProducts";
import Lookbook from "./pages/Lookbook";
import BlogDetail from "./pages/BlogDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SubmitDesign from "./pages/SubmitDesign";
import JoinCommunity from "./pages/JoinCommunity";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import DeleteAccount from "./pages/DeleteAccount";
import PastOrders from "./pages/PastOrders";
import WriteBlog from "./pages/WriteBlog";
import AdminPanel from "./pages/AdminPanel";

// Trending pages
import ParisianChic from "./pages/trending/ParisianChic";
import SustainableFashion from "./pages/trending/SustainableFashion";
import StreetStyle from "./pages/trending/StreetStyle";
import BohemianVibes from "./pages/trending/BohemianVibes";
import VintageRevivalT from "./pages/trending/VintageRevivalT";
import MinimalistWardrobe from "./pages/trending/MinimalistWardrobe";
import CasualSummer from "./pages/trending/CasualSummer";
import WeekendCasual from "./pages/trending/WeekendCasual";
import CasualChic from "./pages/trending/CasualChic";

// Category pages
import MinimalistStyle from "./pages/categories/MinimalistStyle";
import BohemianStyle from "./pages/categories/BohemianStyle";
import FormalStyle from "./pages/categories/FormalStyle";
import VintageStyle from "./pages/categories/VintageStyle";
import CasualStyle from "./pages/categories/CasualStyle";
import StreetwearStyle from "./pages/categories/StreetwearStyle";

// Student pages
import SarahMartinez from "./pages/students/SarahMartinez";

// Collection pages
import SummerVibes from "./pages/collections/SummerVibes";
import ElegantEveningWear from "./pages/collections/ElegantEveningWear";
import BohemianDream from "./pages/collections/BohemianDream";
import StreetStyleEssentials from "./pages/collections/StreetStyleEssentials";
import MinimalistChic from "./pages/collections/MinimalistChic";
import VintageRevival from "./pages/collections/VintageRevival";
import MinimalistElegance from "./pages/collections/MinimalistElegance";
import ConsciousChoices from "./pages/collections/ConsciousChoices";
import HandcraftedBeauty from "./pages/collections/HandcraftedBeauty";

import "./styles/main.css";

import React, { useEffect, useState, createContext, useContext } from "react";
import { Toaster } from "sonner";

// AuthContext setup
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // On mount, check for token and user info
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username });
    }
  }, []);

  const login = (username, accessToken, refreshToken) => {
    setUser({ username });
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('username', username);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <LoadingAnimation />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<Home openQuiz={true} />} />
              <Route path="/trending-looks" element={<TrendingLooks />} />
              <Route path="/style-categories" element={<StyleCategories />} />
              <Route path="/student-spotlights" element={<StudentSpotlights />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/delete-account" element={<DeleteAccount />} />
              <Route path="/past-orders" element={<PastOrders />} />
              <Route path="/write-blog" element={<WriteBlog />} />
              
              {/* Auth pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Admin Panel */}
              <Route path="/admin" element={<AdminPanel />} />
              
              {/* Product routes */}
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/categories/:category/products" element={<CategoryProducts />} />
              <Route path="/collections/:collection/products" element={<CollectionProducts />} />
              
              {/* Blog routes */}
              <Route path="/trending/:slug" element={<BlogDetail />} />
              
              {/* Lookbook route */}
              <Route path="/lookbook/:persona" element={<Lookbook />} />
              
              {/* Individual trending pages */}
              <Route path="/trending/parisian-chic" element={<ParisianChic />} />
              <Route path="/trending/sustainable-fashion" element={<SustainableFashion />} />
              <Route path="/trending/street-style" element={<StreetStyle />} />
              <Route path="/trending/bohemian-vibes" element={<BohemianVibes />} />
              <Route path="/trending/vintage-revivalT" element={<VintageRevivalT />} />
              <Route path="/trending/minimalist-wardrobe" element={<MinimalistWardrobe />} />
              <Route path="/trending/casual-summer" element={<CasualSummer />} />
              <Route path="/trending/weekend-casual" element={<WeekendCasual />} />
              <Route path="/trending/casual-chic" element={<CasualChic />} />
              
              {/* Individual category pages */}
              <Route path="/categories/minimalist" element={<MinimalistStyle />} />
              <Route path="/categories/bohemian" element={<BohemianStyle />} />
              <Route path="/categories/formal" element={<FormalStyle />} />
              <Route path="/categories/vintage" element={<VintageStyle />} />
              <Route path="/categories/casual" element={<CasualStyle />} />
              <Route path="/categories/streetwear" element={<StreetwearStyle />} />
              
              {/* Individual student pages */}
              <Route path="/students/sarah-martinez" element={<SarahMartinez />} />
              
              {/* Individual collection pages */}
              <Route path="/collections/summer-vibes" element={<SummerVibes />} />
              <Route path="/collections/elegant-evening-wear" element={<ElegantEveningWear />} />
              <Route path="/collections/bohemian-dream" element={<BohemianDream />} />
              <Route path="/collections/street-style-essentials" element={<StreetStyleEssentials />} />
              <Route path="/collections/minimalist-chic" element={<MinimalistChic />} />
              <Route path="/collections/vintage-revival" element={<VintageRevival />} />
              <Route path="/collections/minimalist-elegance" element={<MinimalistElegance />} />
              <Route path="/collections/conscious-choices" element={<ConsciousChoices />} />
              <Route path="/collections/handcrafted-beauty" element={<HandcraftedBeauty />} />
              
              {/* Connect pages */}
              <Route path="/submit-design" element={<SubmitDesign />} />
              <Route path="/join-community" element={<JoinCommunity />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
