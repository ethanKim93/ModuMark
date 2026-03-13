import { useState, useEffect } from 'react';
import { useEnvironment } from './useEnvironment';

export function useAppVersion(): { version: string | null } {
  const { isTauri } = useEnvironment();
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!isTauri) return;

    // Tauri 환경에서만 앱 버전 조회
    import('@tauri-apps/api/app')
      .then(({ getVersion }) => getVersion())
      .then(setVersion)
      .catch(() => setVersion(null));
  }, [isTauri]);

  return { version };
}
