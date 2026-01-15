'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // ログイン処理を実行し、完了したらルートへリダイレクト
      // useAuthのloginは同期的ならこれでよいが、通常はここでtokenをセットして
      // 状態が更新されるのを待つか、単にリダイレクトする
      login(token); 
      router.push('/');
    } else {
      router.push('/login?error=No token provided');
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
