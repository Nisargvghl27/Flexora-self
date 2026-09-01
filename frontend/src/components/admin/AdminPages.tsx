import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, ArrowUp, ArrowDown, Eye, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const AdminPages = ({ token }: { token: string }) => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Page Builder State
  const [pageId, setPageId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [blocks, setBlocks] = useState<any[]>([]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await apiService.adminGet('content');
      if (res.error) throw new Error(res.error);
      setPages(res.data?.results || res.data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      const res = await apiService.adminDelete(`content/${id}`);
      if (res.error) throw new Error(res.error);
      toast.success('Page deleted');
      fetchPages();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openCreateModal = () => {
    setPageId(null);
    setTitle('');
    setSlug('');
    setIsPublished(false);
    setBlocks([]);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = async (page: any) => {
    setPageId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setIsPublished(page.is_published === 1);
    
    // Fetch full page to get content
    try {
      const res = await apiService.adminGet(`content/${page.id}`);
      if (res.error) throw new Error(res.error);
      const data = res.data;
      
      let parsedBlocks = [];
      if (typeof data.content === 'string') {
        try {
          parsedBlocks = JSON.parse(data.content);
        } catch (e) {
          // Fallback to rich text
          parsedBlocks = [{ type: 'text', content: data.content }];
        }
      } else if (Array.isArray(data.content)) {
        parsedBlocks = data.content;
      }
      
      setBlocks(parsedBlocks);
      setModalMode('edit');
      setIsModalOpen(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const savePage = async () => {
    try {
      if (!title || !slug) return toast.error('Title and Slug are required');
      
      const url = modalMode === 'create' ? `content` : `content/${pageId}`;
      const payload = {
        title,
        slug,
        is_published: isPublished,
        content: JSON.stringify(blocks)
      };

      const res = modalMode === 'create' 
        ? await apiService.adminPost(url, payload)
        : await apiService.adminPut(url, payload);

      if (res.error) {
        throw new Error(res.error || 'Failed to save');
      }

      toast.success(`Page ${modalMode === 'create' ? 'created' : 'updated'}`);
      setIsModalOpen(false);
      fetchPages();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Block Builder logic
  const addBlock = (type: string) => {
    const newBlock = type === 'text' ? { type, content: '' } 
      : type === 'image' ? { type, url: '', caption: '' }
      : type === 'heading' ? { type, content: '' }
      : { type: 'divider' };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    
    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const updateBlock = (index: number, field: string, value: string) => {
    const newBlocks = [...blocks];
    newBlocks[index][field] = value;
    setBlocks(newBlocks);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Dynamic Pages</h2>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90">
          <Plus className="w-5 h-5" /> Create Page
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Title</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Slug</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : pages.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-gray-500">No pages found.</td></tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-medium">{p.title}</td>
                  <td className="py-3 px-4 text-gray-500">/pages/{p.slug}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a href={`/pages/${p.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="View Page">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => openEditModal(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit Page"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete Page"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-10">
          <div className="bg-white rounded-xl w-full max-w-4xl mx-4 shadow-2xl flex flex-col max-h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{modalMode === 'create' ? 'Create Page' : 'Edit Page'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input type="text" value={title} onChange={e => { setTitle(e.target.value); if (modalMode === 'create') setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. About Us" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. about-us" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-4 h-4 text-primary rounded" />
                    <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                  </label>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-bold text-gray-700">Page Content Blocks</h4>
                <div className="flex gap-2">
                  <button onClick={() => addBlock('heading')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50">+ Heading</button>
                  <button onClick={() => addBlock('text')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50">+ Rich Text</button>
                  <button onClick={() => addBlock('image')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50">+ Image</button>
                  <button onClick={() => addBlock('divider')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50">+ Divider</button>
                </div>
              </div>

              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 relative group">
                    <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"><ArrowUp className="w-3 h-3" /></button>
                      <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"><ArrowDown className="w-3 h-3" /></button>
                      <button onClick={() => removeBlock(index)} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-3 h-3" /></button>
                    </div>

                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{block.type} Block</div>
                    
                    {block.type === 'heading' && (
                      <input type="text" value={block.content} onChange={e => updateBlock(index, 'content', e.target.value)} className="w-full px-3 py-2 border rounded-md text-xl font-bold" placeholder="Heading Text..." />
                    )}
                    {block.type === 'text' && (
                      <textarea value={block.content} onChange={e => updateBlock(index, 'content', e.target.value)} className="w-full px-3 py-2 border rounded-md min-h-[120px]" placeholder="HTML or Markdown text..." />
                    )}
                    {block.type === 'image' && (
                      <div className="space-y-2">
                        <input type="text" value={block.url} onChange={e => updateBlock(index, 'url', e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Image URL (e.g. https://...)" />
                        <input type="text" value={block.caption} onChange={e => updateBlock(index, 'caption', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Image Caption (Optional)" />
                      </div>
                    )}
                    {block.type === 'divider' && (
                      <hr className="my-2 border-gray-300" />
                    )}
                  </div>
                ))}
                
                {blocks.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
                    No blocks added yet. Click a button above to add content.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={savePage} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Page</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPages;
