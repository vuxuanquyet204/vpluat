'use client';

import { useEffect } from 'react';
import { incrementPostViews } from '@/features/news/api/news-api';

interface PostViewTrackerProps {
  postId: string;
}

export function PostViewTracker({ postId }: PostViewTrackerProps) {
  useEffect(() => {
    const storageKey = `post-view:${postId}`;
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, '1');
    void incrementPostViews(postId);
  }, [postId]);

  return null;
}
