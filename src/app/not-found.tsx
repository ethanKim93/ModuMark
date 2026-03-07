import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">404 - 페이지를 찾을 수 없습니다</h1>
      <Link href="/" className="text-primary hover:underline text-base">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
