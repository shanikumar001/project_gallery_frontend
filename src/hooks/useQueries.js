import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../lib/utils';

function useApiHeaders() {
  const { getToken } = useAuth();
  return () => ({
    Authorization: `Bearer ${getToken()}`,
  });
}

export function useGetAllProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });
}

export function useUserProfile(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const getHeaders = useApiHeaders();
  return useMutation({
    mutationFn: async ({ name, username, bio, profilePhoto }) => {
      const formData = new FormData();
      if (name !== undefined) formData.append('name', name);
      if (username !== undefined) formData.append('username', username);
      if (bio !== undefined) formData.append('bio', bio);
      if (profilePhoto) formData.append('profilePhoto', profilePhoto);
      const res = await fetch(`${getApiBase()}/users/me`, {
        method: 'PUT',
        headers: { Authorization: getHeaders().Authorization },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update profile');
      }
      return res.json();
    },
  });
}

export function useAddProject() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ title, description, liveDemoUrl, codeUrl, file, onProgress }) => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (liveDemoUrl) formData.append('liveDemoUrl', liveDemoUrl);
      if (codeUrl) formData.append('codeUrl', codeUrl);
      formData.append('media', file);

      const token = getToken();
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              resolve({});
            }
          } else {
            let message = 'Upload failed';
            try {
              const err = JSON.parse(xhr.responseText);
              message = err.error || message;
            } catch {}
            reject(new Error(message));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
        xhr.open('POST', `${getApiBase()}/projects`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async (projectId) => {
      const res = await fetch(`${getApiBase()}/projects/${projectId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete project');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useLikeProject() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async ({ projectId, liked }) => {
        const res = await fetch(`${getApiBase()}/projects/${projectId}/like`, {
        method: liked ? 'DELETE' : 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to update like');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useSaveProject() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async ({ projectId, saved }) => {
        const res = await fetch(`${getApiBase()}/projects/${projectId}/save`, {
        method: saved ? 'DELETE' : 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to update save');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async ({ projectId, text }) => {
      const res = await fetch(`${getApiBase()}/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// Connections (for Connect / Message - optional quick connect)
export function useConnections() {
  const { user } = useAuth();
  const getHeaders = useApiHeaders();

  return useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/users/connections/list`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch connections');
      return res.json();
    },
    enabled: !!user,
  });
}

export function useConnect() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${getApiBase()}/users/${userId}/connect`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to connect');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useIsConnected(userId) {
  const getHeaders = useApiHeaders();

  return useQuery({
    queryKey: ['connected', userId],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/users/${userId}/connected`, { headers: getHeaders() });
      if (!res.ok) return false;
      const data = await res.json();
      return data.connected;
    },
    enabled: !!userId,
  });
}

// Follow (Instagram-style: request → requested, accept/decline)
export function useFollowUser() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async ({ userId, following, requested }) => {
      const res = await fetch(`${getApiBase()}/users/${userId}/follow`, {
        method: following || requested ? 'DELETE' : 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to update follow');
      return res.json();
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['follow-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useFollowStatus(userId) {
  const { user } = useAuth();
  const getHeaders = useApiHeaders();

  return useQuery({
    queryKey: ['follow-status', userId],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/users/${userId}/follow-status`, { headers: getHeaders() });
      if (!res.ok) return { following: false, requested: false };
      return res.json();
    },
    enabled: !!user && !!userId,
  });
}

export function useFollowRequests() {
  const { user } = useAuth();
  const getHeaders = useApiHeaders();

  return useQuery({
    queryKey: ['follow-requests'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/users/me/follow-requests`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
    enabled: !!user,
  });
}

export function useAcceptFollowRequest() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async (requestId) => {
      const res = await fetch(`${getApiBase()}/users/follow-requests/${requestId}/accept`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to accept');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useDeclineFollowRequest() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async (requestId) => {
      const res = await fetch(`${getApiBase()}/users/follow-requests/${requestId}/decline`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to decline');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follow-requests'] }),
  });
}

export function useFollowersList(userId) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/users/${userId}/followers`);
      if (!res.ok) throw new Error('Failed to fetch followers');
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useFollowingList(userId) {
  return useQuery({
    queryKey: ['following-list', userId],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/users/${userId}/following`);
      if (!res.ok) throw new Error('Failed to fetch following');
      return res.json();
    },
    enabled: !!userId,
  });
}

// Messages (chat) - anyone can message anyone; conversations from message history
export function useConversations() {
  const { user } = useAuth();
  const getHeaders = useApiHeaders();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/messages/conversations`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
    enabled: !!user,
  });
}

export function useUnreadCount() {
  const { user } = useAuth();
  const getHeaders = useApiHeaders();

  return useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/messages/unread-count`, { headers: getHeaders() });
      if (!res.ok) return { count: 0 };
      const data = await res.json();
      return data;
    },
    enabled: !!user,
  });
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async (withUserId) => {
      const res = await fetch(`${getApiBase()}/messages/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ with: withUserId }),
      });
      if (!res.ok) throw new Error('Failed to mark read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMessages(withUserId) {
  const getHeaders = useApiHeaders();

  return useQuery({
    queryKey: ['messages', withUserId],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/messages?with=${withUserId}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!withUserId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const getHeaders = useApiHeaders();

  return useMutation({
    mutationFn: async ({ toUserId, text }) => {
      const res = await fetch(`${getApiBase()}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ toUserId, text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.toUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}
