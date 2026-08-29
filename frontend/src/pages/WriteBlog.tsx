import React, { useState } from 'react';
import { ArrowLeft, Upload, Save, Eye, Tag, Calendar, User, FileText, Image, Hash, TrendingUp, Star, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface BlogFormData {
  title: string;
  author: string;
  content: string;
  excerpt: string;
  category: string;
  cover_image: File | null;
  cover_image_url: string;
  is_trending: boolean;
  is_published: boolean;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  tags: string;
}

const WriteBlog: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    author: '',
    content: '',
    excerpt: '',
    category: '',
    cover_image: null,
    cover_image_url: '',
    is_trending: false,
    is_published: true,
    is_featured: false,
    meta_title: '',
    meta_description: '',
    tags: ''
  });

  const [isPreview, setIsPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const categoryChoices = [
    { value: 'Minimalist', label: 'Minimalist' },
    { value: 'Vintage', label: 'Vintage' },
    { value: 'Streetwear', label: 'Streetwear' },
    { value: 'Bohemian', label: 'Bohemian' },
    { value: 'Formal', label: 'Formal' },
    { value: 'Casual', label: 'Casual' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        cover_image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const testAuthentication = async () => {
    console.log('=== AUTHENTICATION DEBUG ===');
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const username = localStorage.getItem('username');
    
    console.log('Token exists:', !!token);
    console.log('Refresh token exists:', !!refreshToken);
    console.log('Username:', username);
    console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
    
    if (token) {
      try {
        // Try to decode JWT to check expiration
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload:', payload);
          console.log('Token exp:', payload.exp);
          console.log('Current time:', Math.floor(Date.now() / 1000));
          console.log('Token expired:', payload.exp < Math.floor(Date.now() / 1000));
        }
      } catch (e) {
        console.log('Could not decode token:', e);
      }
    }
    
    if (!token) {
      setSubmitError('No authentication token found. Please log in again.');
      return;
    }
    
    // Test with a simple authenticated endpoint
    console.log('Testing with profile endpoint...');
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${baseURL}/api/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile endpoint response status:', response.status);
      console.log('Profile endpoint response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 401) {
        const text = await response.text().catch(() => '');
        let errorData: any = {};
        try { if (text) errorData = JSON.parse(text); } catch (_) {}
        console.log('401 Error details:', errorData);
        setSubmitError(`Token is invalid or expired. Error: ${JSON.stringify(errorData)}. Please log in again.`);
      } else if (response.ok) {
        const text = await response.text();
        let data: any = {};
        try { if (text) data = JSON.parse(text); } catch (_) {}
        console.log('Profile data:', data);
        setSubmitError('');
        alert('Authentication test successful! Token is valid.');
      } else {
        const text = await response.text().catch(() => '');
        let errorData: any = {};
        try { if (text) errorData = JSON.parse(text); } catch (_) {}
        console.log('Other error:', errorData);
        setSubmitError(`Unexpected error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Network error during auth test:', error);
      setSubmitError(`Network error: ${error}`);
    }
    
    console.log('=== END AUTHENTICATION DEBUG ===');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Create FormData for file upload support
      const formDataToSubmit = new FormData();
      
      // Add all form fields to FormData
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('author', formData.author);
      formDataToSubmit.append('content', formData.content);
      formDataToSubmit.append('excerpt', formData.excerpt);
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('is_trending', formData.is_trending.toString());
      formDataToSubmit.append('is_published', formData.is_published.toString());
      formDataToSubmit.append('is_featured', formData.is_featured.toString());
      formDataToSubmit.append('meta_title', formData.meta_title);
      formDataToSubmit.append('meta_description', formData.meta_description);
      formDataToSubmit.append('tags', formData.tags);
      
      // Add cover image if provided
      if (formData.cover_image) {
        formDataToSubmit.append('cover_image', formData.cover_image);
      } else if (formData.cover_image_url) {
        formDataToSubmit.append('cover_image_url', formData.cover_image_url);
      }
      
      // Submit to API
      const response = await apiService.createBlog(formDataToSubmit);
      
      if (response.error) {
        setSubmitError(response.error + (response.details ? `: ${response.details}` : ''));
        return;
      }
      
      // Success - show message and redirect
      alert('Blog post created successfully!');
      navigate('/profile');
      
    } catch (error) {
      console.error('Error submitting blog:', error);
      setSubmitError('Failed to submit blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Create FormData for file upload support
      const formDataToSubmit = new FormData();
      
      // Add all form fields to FormData
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('author', formData.author);
      formDataToSubmit.append('content', formData.content);
      formDataToSubmit.append('excerpt', formData.excerpt);
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('is_trending', formData.is_trending.toString());
      formDataToSubmit.append('is_published', 'false'); // Save as draft
      formDataToSubmit.append('is_featured', formData.is_featured.toString());
      formDataToSubmit.append('meta_title', formData.meta_title);
      formDataToSubmit.append('meta_description', formData.meta_description);
      formDataToSubmit.append('tags', formData.tags);
      
      // Add cover image if provided
      if (formData.cover_image) {
        formDataToSubmit.append('cover_image', formData.cover_image);
      } else if (formData.cover_image_url) {
        formDataToSubmit.append('cover_image_url', formData.cover_image_url);
      }
      
      // Submit to API
      const response = await apiService.createBlog(formDataToSubmit);
      
      if (response.error) {
        setSubmitError(response.error + (response.details ? `: ${response.details}` : ''));
        return;
      }
      
      // Success - show message and redirect
      alert('Draft saved successfully!');
      navigate('/profile');
      
    } catch (error) {
      console.error('Error saving draft:', error);
      setSubmitError('Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/profile" 
                className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Profile
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Write a Blog Post</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={testAuthentication}
                className="flex items-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                🔍 Test Auth
              </button>
              
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreview ? 'Edit' : 'Preview'}
              </button>
              
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error submitting blog post</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{submitError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!isPreview ? (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your blog post title"
                  />
                </div>
                
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Author *
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Author name"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categoryChoices.map(choice => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                  <span className="text-gray-500 text-xs ml-1">(Short summary, max 500 characters)</span>
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write a brief summary of your blog post..."
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.excerpt.length}/500 characters
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Content *
              </h2>
              
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Write your blog content here..."
              />
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Image className="h-5 w-5 mr-2 text-purple-600" />
                Cover Image
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    id="cover_image"
                    name="cover_image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="text-center text-gray-500">OR</div>
                
                <div>
                  <label htmlFor="cover_image_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="cover_image_url"
                    name="cover_image_url"
                    value={formData.cover_image_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                {(imagePreview || formData.cover_image_url) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={imagePreview || formData.cover_image_url}
                      alt="Cover preview"
                      className="w-full max-w-md h-48 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SEO & Metadata */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-purple-600" />
                SEO & Metadata
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                    <span className="text-gray-500 text-xs ml-1">(max 60 characters)</span>
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="SEO optimized title"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.meta_title.length}/60 characters
                  </div>
                </div>
                
                <div>
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                    <span className="text-gray-500 text-xs ml-1">(max 160 characters)</span>
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="SEO description for search engines"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.meta_description.length}/160 characters
                  </div>
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="h-4 w-4 inline mr-1" />
                    Tags
                    <span className="text-gray-500 text-xs ml-1">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="fashion, style, trends, minimalist"
                  />
                </div>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Publishing Options
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                    Publish immediately
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                    <Star className="h-4 w-4 inline mr-1" />
                    Mark as featured (homepage display)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_trending"
                    name="is_trending"
                    checked={formData.is_trending}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_trending" className="ml-2 block text-sm text-gray-700">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    Mark as trending
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/profile"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Publishing...' : 'Publish Blog Post'}
              </button>
            </div>
          </form>
        ) : (
          /* Preview Mode */
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="max-w-3xl mx-auto">
              {/* Cover Image */}
              {(imagePreview || formData.cover_image_url) && (
                <div className="mb-8">
                  <img
                    src={imagePreview || formData.cover_image_url}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Category Badge */}
              {formData.category && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    {formData.category}
                  </span>
                </div>
              )}
              
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {formData.title || 'Blog Title'}
              </h1>
              
              {/* Author and Meta */}
              <div className="flex items-center text-gray-600 text-sm mb-6">
                <User className="h-4 w-4 mr-1" />
                <span>{formData.author || 'Author Name'}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              
              {/* Excerpt */}
              {formData.excerpt && (
                <div className="text-lg text-gray-600 mb-8 italic border-l-4 border-purple-200 pl-4">
                  {formData.excerpt}
                </div>
              )}
              
              {/* Content */}
              <div className="prose max-w-none">
                {formData.content ? (
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {formData.content}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Blog content will appear here...</p>
                )}
              </div>
              
              {/* Tags */}
              {formData.tags && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteBlog;
