import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, Blog } from '../services/api';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';
import { Skeleton } from '../components/ui/skeleton';
import { Skeleton } from '../components/ui/skeleton';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import ShareButton from '../components/ui/ShareButton';

export const CommentsSection = ({ slug, blog }: { slug: string, blog: Blog }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchComments = async () => {
    try {
      const response = await apiService.getBlogComments(slug);
      if (response.data) {
        setComments(response.data);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const handleSubmitComment = async (parentId?: string) => {
    const text = parentId ? replyText : commentText;
    if (!text.trim()) return;

    try {
      const res = await apiService.addBlogComment(slug, text, parentId);
      if (res.data) {
        if (parentId) {
          setReplyText('');
          setReplyingTo(null);
        } else {
          setCommentText('');
        }
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await apiService.deleteBlogComment(slug, commentId);
      fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const renderComment = (comment: any, isReply: boolean = false) => (
    <div className={`flex gap-4 ${isReply ? 'ml-12 mt-4' : 'mt-6 border-b border-border pb-6'}`}>
      <div className="flex-shrink-0">
        {comment.profile_picture ? (
          <img src={comment.profile_picture} alt={comment.username} className="w-10 h-10 rounded-full object-cover border border-border" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            {comment.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{comment.username}</span>
            <span className="text-xs text-muted-foreground">{comment.time_ago}</span>
          </div>
          {user?.username === comment.username && (
            <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:text-red-700 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">{comment.content}</p>

        {!isReply && user && (
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Reply
          </button>
        )}

        {replyingTo === comment.id && (
          <div className="mt-4 flex gap-2">
            <textarea
              className="flex-grow min-h-[60px] p-2 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              placeholder="Write a reply..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
            />
            <button
              onClick={() => handleSubmitComment(comment.id)}
              className="px-4 py-2 h-fit bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90"
            >
              Reply
            </button>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply: any) => (
              <div key={reply.id}>
                {renderComment(reply, true)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-12 bg-card rounded-xl p-8 border border-border">
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-primary" />
        Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h3>

      {user ? (
        <div className="mb-8 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow flex flex-col items-end gap-2">
            <textarea
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none resize-y"
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button
              onClick={() => handleSubmitComment()}
              disabled={!commentText.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Post Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-accent rounded-lg text-center border border-border">
          <h4 className="text-lg font-medium text-foreground mb-2">Join the conversation</h4>
          <p className="text-muted-foreground mb-4">Please log in to share your thoughts.</p>
          <Link to="/login" className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium inline-block">
            Login to comment
          </Link>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading comments...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) {
        setError('Blog slug is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getBlog(slug);

        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setBlog(response.data);
        } else {
          setError('Blog not found');
        }
      } catch (err) {
        setError('Failed to load blog');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (user && blog) {
      // Load user's interaction state
      const likedPosts = getStorageData(STORAGE_KEYS.LIKED_POSTS, user.username, []);
      const favoritePosts = getStorageData(STORAGE_KEYS.FAVORITE_POSTS, user.username, []);

      setLiked(likedPosts.includes(blog.id));
      setFavorited(favoritePosts.includes(blog.id));
    }
  }, [user, blog]);

  const handleLike = async () => {
    if (!blog) return;

    try {
      const response = await apiService.likeBlog(blog.id);

      if (response.error) {
        console.error('Error liking blog:', response.error);
        return;
      }

      // Update local state
      setLiked(!liked);
      setBlog(prev => prev ? { ...prev, likes_count: liked ? prev.likes_count - 1 : prev.likes_count + 1 } : null);

      // Update storage
      const likedPosts = getStorageData(STORAGE_KEYS.LIKED_POSTS, user?.username, []);
      if (liked) {
        const newLikedPosts = likedPosts.filter(id => id !== blog.id);
        setStorageData(STORAGE_KEYS.LIKED_POSTS, newLikedPosts, user?.username);
      } else {
        setStorageData(STORAGE_KEYS.LIKED_POSTS, [...likedPosts, blog.id], user?.username);
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  const handleFavorite = () => {
    if (!blog) return;

    setFavorited(!favorited);

    // Update storage
    const favoritePosts = getStorageData(STORAGE_KEYS.FAVORITE_POSTS, user?.username, []);
    if (favorited) {
      const newFavoritePosts = favoritePosts.filter(id => id !== blog.id);
      setStorageData(STORAGE_KEYS.FAVORITE_POSTS, newFavoritePosts, user?.username);
    } else {
      setStorageData(STORAGE_KEYS.FAVORITE_POSTS, [...favoritePosts, blog.id], user?.username);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="w-full">
          <section className="w-full py-24 bg-gradient-to-br from-primary/30 to-secondary text-center">
            <div className="max-w-3xl mx-auto px-4 flex flex-col items-center">
              <Skeleton className="h-12 w-3/4 mb-6 bg-background/50" />
              <Skeleton className="h-6 w-1/2 bg-background/50" />
            </div>
          </section>
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-6 mb-8">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="bg-card rounded-xl p-8 border border-border mb-8">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Blog Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The blog you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="w-full">
        <PageHero
          title={blog.title}
          subtitle={blog.excerpt}
          backgroundGradient="from-primary/30 to-secondary"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Blogs</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{blog.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-6 mb-6">
                <div className="flex items-center flex-wrap gap-6">
                  <Link to={`/products`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <User className="w-5 h-5" />
                    <span className="font-medium">by {blog.author}</span>
                  </Link>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{blog.time_ago}</span>
                  </div>
                  {(blog as any).reading_time && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="w-5 h-5" />
                      <span>{(blog as any).reading_time}</span>
                    </div>
                  )}
                </div>
                <ShareButton
                  title={blog.title}
                  text={`Check out this blog: ${blog.title}`}
                  url={window.location.href}
                />
              </div>

              {blog.tags && (
                <div className="flex flex-wrap gap-2 ml-auto">
                  {blog.tags.split(',').map((tag, index) => (
                    <Link
                      key={index}
                      to={`/products`}
                      className="inline-block px-3 py-1 text-xs bg-accent text-accent-foreground font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      #{tag.trim()}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl p-8 border border-border mb-8 shadow-sm">
              <div
                className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-6">
              <div className="flex items-center gap-6">
                <div
                  className={`flex items-center gap-2 transition-colors cursor-pointer ${liked ? 'text-red-500' : 'hover:text-primary'
                    }`}
                  onClick={handleLike}
                >
                  <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
                  <span className="font-medium text-base">{blog.likes_count} likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  <span className="font-medium text-base">{blog.views_count} views</span>
                </div>
              </div>
              <button
                className={`flex items-center gap-2 transition-colors ${favorited ? 'text-yellow-500' : 'hover:text-primary'
                  }`}
                onClick={handleFavorite}
              >
                <Heart className={`w-6 h-6 ${favorited ? 'fill-current' : ''}`} />
                <span className="font-medium text-base">{favorited ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {slug && <CommentsSection slug={slug} blog={blog} />}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
