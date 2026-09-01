import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface ProfileData {
  username: string;
  email: string;
  phone?: string;
  address?: string;
  account_type?: string;
  profile_picture?: string;
  selected_avatar?: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('accessToken');

  const query = useQuery<ProfileData, Error>({
    queryKey: ['profile', user?.username],
    queryFn: async () => {
      const response = await apiService.getProfile();
      if (response.error) {
        throw new Error(response.error || 'Failed to fetch profile');
      }
      return response.data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  const refetchProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetchProfile
  };
};
