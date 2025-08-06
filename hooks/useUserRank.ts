import { useState, useEffect } from 'react';
import { UserService } from '../services';
import { useAuth } from '../contexts/AuthContext';

export const useUserRank = () => {
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchUserRank = async () => {
    if (!user || !profile) {
      setUserRank(null);
      setLoading(false);
      return;
    }

    try {
      const { rank, error } = await UserService.fetchUserRank(user.id, profile.total_points);

      if (error) {
        console.error('Error fetching user rank:', error);
        setUserRank(null);
      } else {
        setUserRank(rank);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
      setUserRank(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRank();
  }, [profile?.total_points]);

  return {
    userRank,
    loading,
    refetch: fetchUserRank,
  };
};