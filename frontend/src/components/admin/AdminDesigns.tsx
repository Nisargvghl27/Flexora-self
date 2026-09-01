import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../../services/api';

interface Design {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  status: string;
  created_at: string;
  designer_name: string;
  designer_email: string;
}

const AdminDesigns = ({ token }: { token: string }) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingDesigns = async () => {
    try {
      setLoading(true);
      const res = await apiService.adminGet('designs/pending');
      if (res.error) throw new Error(res.error);
      setDesigns(res.data?.results || res.data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDesigns();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await apiService.adminPut(`designs/${id}/status`, { status });
      
      if (res.error) throw new Error(res.error);
      
      toast.success(`Design ${status} successfully`);
      setDesigns(designs.filter(d => d.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Design Submissions</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Pending Review</h3>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{designs.length} Pending</span>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading pending designs...</div>
        ) : designs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No pending design submissions.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {designs.map(design => (
              <div key={design.id} className="p-4 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={design.image_url} alt={design.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-foreground">{design.title}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        By <span className="font-medium text-gray-700">{design.designer_name}</span> ({design.designer_email})
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(design.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateStatus(design.id, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={() => updateStatus(design.id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100 whitespace-pre-wrap">
                    {design.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDesigns;
