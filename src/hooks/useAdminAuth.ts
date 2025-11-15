import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return { getAuthHeaders, logout };
}
