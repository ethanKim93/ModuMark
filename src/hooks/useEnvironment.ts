import { useState, useEffect } from 'react';
import { isTauriApp } from '@/lib/environment';

export function useEnvironment() {
  /* SSR: false, 클라이언트 마운트 후 실제 환경 감지 */
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    setIsTauri(isTauriApp());
  }, []);

  return { isTauri, isWeb: !isTauri };
}
