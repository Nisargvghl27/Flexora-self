import React, { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";

// Lazy-loaded pages
const Home = React.lazy(() => import("./pages/Home"));
const Collections = React.lazy(() => import("./pages/Collections"));
const Favorites = React.lazy(() => import("./pages/Favorites"));
const Products = React.lazy(() => import("./pages/Products"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const CategoryProducts = React.lazy(() => import("./pages/CategoryProducts"));
const CollectionProducts = React.lazy(() => import("./pages/CollectionProducts"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Profile = React.lazy(() => import("./pages/Profile"));
const EditProfile = React.lazy(() => import("./pages/EditProfile"));
const DeleteAccount = React.lazy(() => import("./pages/DeleteAccount"));
const PastOrders = React.lazy(() => import("./pages/PastOrders"));
const WriteBlog = React.lazy(() => import("./pages/WriteBlog"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const BlogDetail = React.lazy(() => import("./pages/BlogDetail"));
const CommunityFeed = React.lazy(() => import("./pages/CommunityFeed"));
const JoinCommunity = React.lazy(() => import("./pages/JoinCommunity"));
const DesignShowcase = React.lazy(() => import("./pages/DesignShowcase"));
const SubmitDesign = React.lazy(() => import("./pages/SubmitDesign"));
const Lookbook = React.lazy(() => import("./pages/Lookbook"));
const TrendingLooks = React.lazy(() => import("./pages/TrendingLooks"));
const StyleCategories = React.lazy(() => import("./pages/StyleCategories"));
const StudentSpotlights = React.lazy(() => import("./pages/StudentSpotlights"));
const DynamicPage = React.lazy(() => import("./pages/DynamicPage"));
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess"));


const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ErrorBoundary>
              <BrowserRouter>
                <Toaster />
                <main id="main-content" className="flex-1 flex flex-col min-h-screen w-full pb-16 md:pb-0">
                  <Suspense fallback={<div className="flex-1 flex justify-center items-center h-full min-h-[50vh]"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/quiz" element={<Home openQuiz={true} />} />
                      <Route path="/collections" element={<Collections />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                  
                  {/* Protected User Routes */}
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                  <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
                  <Route path="/past-orders" element={<ProtectedRoute><PastOrders /></ProtectedRoute>} />
                  <Route path="/write-blog" element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} />
                  <Route path="/submit-design" element={<ProtectedRoute><SubmitDesign /></ProtectedRoute>} />
                  
                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPanel /></ProtectedRoute>} />
                  
                  {/* Auth pages */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Product routes */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/category/:category" element={<CategoryProducts />} />
                  <Route path="/collections/:id" element={<CollectionProducts />} />
                  
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/blog/:id" element={<BlogDetail />} />
                  <Route path="/community" element={<CommunityFeed />} />
                  <Route path="/join-community" element={<JoinCommunity />} />
                  <Route path="/designs" element={<DesignShowcase />} />
                  <Route path="/lookbook/:id" element={<Lookbook />} />
                  <Route path="/trending" element={<TrendingLooks />} />
                  <Route path="/categories" element={<StyleCategories />} />
                  <Route path="/spotlights" element={<StudentSpotlights />} />
                  <Route path="/page/:slug" element={<DynamicPage />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <BottomNav />
          </BrowserRouter>
            </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
