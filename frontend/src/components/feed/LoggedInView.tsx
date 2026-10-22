'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest, getMediaUrl } from '@/lib/api';
import { clearAuth, getSavedUser } from '@/lib/auth';
import { Post, Profile } from '@/types';

interface LoggedInViewProps {
  onLogout: () => void;
}

export default function LoggedInView({ onLogout }: LoggedInViewProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getSavedUser();
    setCurrentUser(user);

    async function fetchData() {
      try {
        const token = localStorage.getItem('instagram_token') || undefined;
        // Fetch current user profile
        try {
          const prof = await apiRequest<Profile>('/profiles/me', {}, token);
          setProfile(prof);
        } catch (e) {
          console.warn('Could not load profile:', e);
        }

        // Fetch posts
        try {
          const res = await apiRequest<{ items: Post[] }>('/posts', {}, token);
          setPosts(res.items || []);
        } catch (e) {
          console.warn('Could not load posts:', e);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLogout = () => {
    clearAuth();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center">
            <div className="w-full h-full rounded-[8px] flex items-center justify-center border border-white">
              <div className="w-2.5 h-2.5 rounded-full border border-white" />
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight">Instagram</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-[#f09433] to-[#bc1888] p-[1.5px]">
              <div className="w-full h-full rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={getMediaUrl(profile.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (currentUser?.userName?.[0] || 'U').toUpperCase()
                )}
              </div>
            </div>
            <div className="text-xs font-semibold">
              {profile?.fullName || currentUser?.userName || 'Пользователь'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Main Content Feed */}
      <main className="max-w-lg mx-auto py-6 px-4">
        {/* Welcome card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 mb-1">
            Добро пожаловать в Instagram! 🎉
          </h2>
          <p className="text-xs text-neutral-500 mb-3">
            Вы успешно вошли как <span className="font-semibold text-neutral-800">@{currentUser?.userName || 'user'}</span>.
          </p>
          <div className="flex gap-4 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
            <div>
              <span className="font-bold text-neutral-900">{profile?.postsCount || posts.length}</span> публикаций
            </div>
            <div>
              <span className="font-bold text-neutral-900">{profile?.followersCount || 0}</span> подписчиков
            </div>
            <div>
              <span className="font-bold text-neutral-900">{profile?.followingCount || 0}</span> подписок
            </div>
          </div>
        </div>

        {/* Posts list */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider px-1">
            Публикации
          </h3>

          {loading ? (
            <div className="text-center py-10 text-neutral-400 text-sm">
              Загрузка публикаций...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-500 text-sm">
              Пока нет публикаций.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Post header */}
                <div className="p-3.5 flex items-center justify-between border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 text-xs font-bold flex items-center justify-center">
                      {(post.user?.userName?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        {post.user?.userName}
                      </div>
                      {post.location && (
                        <div className="text-[10px] text-neutral-400">
                          {post.location.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-neutral-400 text-xs">•••</span>
                </div>

                {/* Post Image */}
                <div className="aspect-square bg-neutral-100 relative overflow-hidden flex items-center justify-center">
                  {post.images?.[0] ? (
                    <img
                      src={getMediaUrl(post.images[0].imageUrl)}
                      alt={post.title || 'Post image'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-neutral-400 text-xs">Нет изображения</span>
                  )}
                </div>

                {/* Post actions & caption */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-3">
                      <span>❤️</span>
                      <span>💬</span>
                      <span>🚀</span>
                    </div>
                    <span>🔖</span>
                  </div>

                  <div className="text-xs font-bold text-neutral-900">
                    {post.likesCount || 0} отметок "Нравится"
                  </div>

                  {post.content && (
                    <div className="text-xs text-neutral-800">
                      <span className="font-bold mr-1.5">{post.user?.userName}</span>
                      {post.content}
                    </div>
                  )}

                  <div className="text-[11px] text-neutral-400">
                    {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
