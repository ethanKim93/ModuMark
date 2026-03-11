'use client';

const CONSENT_KEY = 'cookie-consent';

export function CookieResetButton() {
  const handleReset = () => {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch { /* 무시 */ }
    window.location.reload();
  };

  return (
    <button
      onClick={handleReset}
      className="text-[12px] text-muted-foreground hover:text-foreground transition-colors text-left"
    >
      쿠키 설정
    </button>
  );
}
