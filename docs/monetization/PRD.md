# Monetization 도메인 PRD
# ModuMark - 수익화 제품 요구사항

| 항목 | 내용 |
|------|------|
| 문서 버전 | v3.0 |
| 작성일 | 2026-03-07 |
| 최종 수정 | 2026-03-11 |
| 상위 문서 | [docs/PRD.md](../PRD.md) · [docs/monetization/BRD.md](./BRD.md) |
| 상태 | Active (Phase 1 완료, AdSense 승인 완료, Phase 3 AdSense 콘텐츠 강화 계획) |

---

## 목차

1. [기능 요구사항 (MoSCoW)](#1-기능-요구사항-moscow)
2. [광고 배치 전략](#2-광고-배치-전략)
3. [사용자 스토리](#3-사용자-스토리)
4. [Ad Blocker 대응 전략](#4-ad-blocker-대응-전략)
5. [비기능 요구사항](#5-비기능-요구사항)
6. [AdSense 승인 체크리스트](#6-adsense-승인-체크리스트)

---

## 1. 기능 요구사항 (MoSCoW)

### Must Have

| 기능 ID | 기능 | 설명 |
|---------|------|------|
| MN-M1 | AdSense 스크립트 통합 | `layout.tsx`에 AdSense 스크립트 async 로딩 ✅ Phase 1 완료. ✅ 실제 ID 적용 완료 (`NEXT_PUBLIC_ADSENSE_ID=ca-pub-1815575117157423`) |
| MN-M2 | 광고 슬롯 컴포넌트 | `<AdSlot />` 재사용 가능 컴포넌트 ✅ Phase 1 완료 (`components/ads/AdSlot.tsx`) |
| MN-M2-F | FloatingAdSlot 컴포넌트 | 플로팅 광고 슬롯 컴포넌트 ✅ Phase 1 완료 (`components/ads/FloatingAdSlot.tsx`) |
| MN-M3 | Lazy Loading | 광고 슬롯이 뷰포트 진입 시 로딩 (Intersection Observer API) ✅ Phase 1 완료 |
| MN-M4 | CLS 방지 | 광고 슬롯에 명시적 min-height 설정으로 레이아웃 이동 방지 ✅ Phase 1 완료 |
| MN-M5 | 웹 전용 노출 | `isTauriApp()` 확인 후 광고 컴포넌트 렌더링. Tauri 앱에서 미노출 ✅ Phase 1 완료 |
| MN-M6 | 광고 정책 설정 | AdSense 정책 센터에서 성인·도박 등 부적절 카테고리 차단 |
| MN-M7 | SiteHeader 통일 컴포넌트 | `src/components/layout/SiteHeader.tsx` — 로고, 주요 페이지 네비게이션(홈·마크다운·PDF·About), ThemeToggle, 모바일 햄버거 메뉴 포함. 모든 공개 페이지에 적용 |
| MN-M8 | SiteFooter 통일 컴포넌트 | `src/components/layout/SiteFooter.tsx` — 도구 링크(마크다운·PDF 병합·PDF 분할·OCR), 법적 링크(개인정보처리방침·이용약관·보안정책), 연락처(`modu.markdown@gmail.com`) 포함 |
| MN-M9 | ToolHero SSR 컴포넌트 | `src/components/common/ToolHero.tsx` — 도구 페이지에 크롤러가 읽을 수 있는 도구 설명 텍스트를 SSR로 제공하는 컴포넌트. title, description, features(배열), usageSteps(배열) props를 받아 렌더링 |
| MN-M10 | CookieConsentBanner | `src/components/common/CookieConsentBanner.tsx` — GDPR 준수 쿠키 동의 배너. 동의/거부 버튼, localStorage에 `cookie-consent` 키로 저장, 동의한 경우 재표시 없음 |
| MN-M11 | About 페이지 | `src/app/about/page.tsx` — 1000자 이상 서비스 소개, ModuMark 제작 목적, 핵심 기능 소개, 개인정보 보호 철학, 연락처(`modu.markdown@gmail.com`) 포함 |
| MN-M12 | /markdown 페이지 ToolHero 삽입 | 마크다운 에디터 페이지에 ToolHero 컴포넌트 삽입. 에디터 컴포넌트 아래 배치. SSR로 800자 이상 고유 텍스트 제공 |
| MN-M13 | /pdf 페이지 ToolHero 삽입 | PDF 통합 도구 페이지에 ToolHero 컴포넌트 삽입. SSR로 800자 이상 고유 텍스트 제공 |
| MN-M14 | PDF 하위 라우트 SSR 복원 | `/pdf/merge`, `/pdf/split`, `/pdf/ocr` — 각 페이지에서 redirect 제거, 고유 SSR 콘텐츠(각 페이지별 기능 설명 800자 이상) 포함. 각 페이지는 독립적인 URL과 메타데이터를 보유 |
| MN-M15 | 개인정보처리방침 GDPR 보강 | `/privacy` 페이지에 GDPR 준수 조항 추가: 쿠키 종류별 설명(필수/분석/광고), 사용자 권리(열람·삭제·이의제기), AdSense 쿠키 옵트아웃 방법, 연락처 이메일 명시 |
| MN-M16 | 공개 페이지 광고 슬롯 배치 | 랜딩 페이지(`/`) 2개, About 페이지(`/about`) 2개, 법적 페이지(`/privacy`, `/terms`, `/security`) 각 1개 AdSlot 추가 |
| MN-M17 | sitemap.ts 업데이트 | `/about`, `/guide`, `/guide/markdown-basics`, `/guide/pdf-merge`, `/guide/pdf-split`, `/guide/ocr`, `/guide/keyboard-shortcuts`, `/pdf/merge`, `/pdf/split`, `/pdf/ocr` URL 추가 |
| MN-M18 | 구조화 데이터 보강 | 랜딩 페이지에 FAQPage 스키마(Schema.org) 추가, About 페이지에 Organization 스키마 추가 (`src/lib/structured-data.ts` 확장) |
| MN-M19 | 랜딩 페이지 콘텐츠 보강 | `src/app/page.tsx` — 사용 방법 3단계 섹션, FAQ 5-7개 섹션 추가. 전체 페이지 SSR 텍스트 1500자 이상 확보 |

### Should Have

| 기능 ID | 기능 | 설명 |
|---------|------|------|
| MN-S1 | Ad Blocker 감지 | 광고 차단기 사용 여부 감지 |
| MN-S2 | Ad Blocker 안내 | 감지 시 비폭력적 안내 배너 표시 (기능 차단 없음) |
| MN-S3 | 모바일 광고 숨김 | 375px 미만 화면에서 광고 슬롯 자동 숨김 |
| MN-S4 | 광고 실패 처리 | 광고 로딩 실패 시 슬롯 공간 제거, 레이아웃 복구 |
| MN-S5 | 가이드 인덱스 페이지 | `src/app/guide/page.tsx` — 전체 가이드 목록 페이지. 각 가이드 링크, 가이드별 요약, 난이도 표시 |
| MN-S6 | 마크다운 기초 가이드 | `src/app/guide/markdown-basics/page.tsx` — 마크다운 문법 기초(헤딩·볼드·이탤릭·링크·이미지·코드블록·테이블 등) 1000자 이상 |
| MN-S7 | PDF 병합 가이드 | `src/app/guide/pdf-merge/page.tsx` — PDF 파일 병합 방법 단계별 설명 1000자 이상 |
| MN-S8 | PDF 분할 가이드 | `src/app/guide/pdf-split/page.tsx` — PDF 페이지 범위 지정 분할 방법 1000자 이상 |
| MN-S9 | OCR 가이드 | `src/app/guide/ocr/page.tsx` — PDF 텍스트 추출(OCR) 방법 및 활용 1000자 이상 |
| MN-S10 | 키보드 단축키 가이드 | `src/app/guide/keyboard-shortcuts/page.tsx` — 에디터·PDF 도구 전체 단축키 목록 1000자 이상 |

### Could Have

| 기능 ID | 기능 | 설명 |
|---------|------|------|
| MN-C1 | 광고 배치 A/B 테스트 | Phase 2B: 위치별 CTR 비교 |
| MN-C2 | 수익 대시보드 연동 | AdSense API로 수익 현황 확인 (내부용) |

---

## 2. 광고 배치 전략

### 2.1 광고 슬롯 위치

| 슬롯 | 위치 | 크기 | 노출 조건 | 우선순위 |
|------|------|------|----------|---------|
| HEADER | 헤더 하단 배너 | responsive (728×90 데스크탑) | 모든 공개 페이지 | 높음 |
| SIDEBAR_RIGHT | 에디터 오른쪽 사이드바 | 300×250 | 에디터 페이지, 화면폭 1024px 이상 | 중간 |
| CONTENT_BOTTOM | 소개 페이지 콘텐츠 하단 | responsive | 공개 소개·가이드 페이지 | 높음 |
| FOOTER | 하단 푸터 영역 | 320×50 모바일 / 728×90 데스크탑 | 모든 공개 페이지, 모바일 포함 | 낮음 |

### 2.2 광고 배치 원칙

- 에디터 캔버스(편집 영역)에는 광고 미노출. 사이드바에만 허용
- PDF 처리 진행 중(처리 중 오버레이 표시 시)에는 광고 갱신 일시 정지
- 광고와 콘텐츠 사이 명확한 시각적 구분 (AdSense 정책 준수)
- 광고 위·아래에 "광고" 또는 "AD" 레이블 표시 (AdSense 요구사항)

### 2.3 광고 컴포넌트 구현 예시

```typescript
// components/ad/AdSlot.tsx
interface AdSlotProps {
  adUnitId: string
  position: 'HEADER' | 'SIDEBAR_RIGHT' | 'CONTENT_BOTTOM' | 'FOOTER'
  className?: string
}

export function AdSlot({ adUnitId, position, className }: AdSlotProps) {
  // 데스크탑 앱(Tauri)에서는 광고 미노출
  if (!isWebEnvironment()) return null
  // 모바일 화면에서 SIDEBAR_RIGHT 미노출
  // ...
  return (
    <div className={cn('ad-slot', className)} style={{ minHeight: AD_MIN_HEIGHTS[position] }}>
      {/* data-ad-client: process.env.NEXT_PUBLIC_ADSENSE_ID (ca-pub-1815575117157423) */}
      <ins className="adsbygoogle" data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID} data-ad-slot={adUnitId} />
    </div>
  )
}
```

---

## 3. 사용자 스토리

| ID | 스토리 | 수용 기준 |
|----|--------|----------|
| US-MN-01 | 나는 사용자로서 광고가 편집 작업을 방해하지 않길 원한다 | 에디터 편집 영역에 광고 없음. 광고는 사이드바·헤더·푸터에만 위치 |
| US-MN-02 | 나는 모바일에서 편집할 때 좁은 화면을 광고로 낭비하지 않길 원한다 | 375px 미만 화면에서 광고 슬롯 숨김 |
| US-MN-03 | 나는 광고 차단기를 쓰더라도 기능이 차단되지 않길 원한다 | 광고 차단기 감지 시 기능 차단 없이 안내 배너만 표시 |
| US-MN-04 (프로젝트 오너) | 나는 AdSense 광고로 월 $200 이상 수익을 안정적으로 창출하고 싶다 | 출시 6개월 후 AdSense 대시보드에서 월 $200 이상 확인 |
| US-MN-05 | 나는 처음 방문한 사용자로서 ModuMark가 어떤 서비스인지 빠르게 파악하고 싶다 | 랜딩 페이지에서 서비스 설명, 사용 방법 3단계, FAQ를 스크롤 없이 또는 한 번의 스크롤로 확인 가능 |
| US-MN-06 | 나는 마크다운 문법을 처음 접하는 사용자로서 기초 문법을 참고하고 싶다 | /guide/markdown-basics 페이지에서 헤딩·볼드·링크·코드블록 등 기초 문법 예시를 확인 가능 |
| US-MN-07 | 나는 EU 사용자로서 내 쿠키 동의 여부를 선택하고 싶다 | 최초 방문 시 쿠키 동의 배너 표시, 동의/거부 선택 후 재표시 없음 |

---

## 4. Ad Blocker 대응 전략

### 4.1 감지 방법

```typescript
// 광고 차단기 감지: 미끼 요소 방식
async function detectAdBlocker(): Promise<boolean> {
  try {
    await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
      method: 'HEAD',
      mode: 'no-cors',
    })
    return false
  } catch {
    return true  // 광고 차단기가 요청을 차단한 경우
  }
}
```

### 4.2 대응 메시지 (비폭력적)

- 차단기 감지 시 하단에 가벼운 안내 배너 표시:
  > "ModuMark는 광고로 무료 서비스를 유지합니다. 광고 차단기를 해제해 주시면 큰 도움이 됩니다."
- 닫기 버튼 제공. 메시지 닫은 후 재표시 없음 (세션 내 1회)
- 기능 차단·접근 제한 없음

---

## 5. 비기능 요구사항

### 5.1 성능

| 요구사항 | 목표 |
|---------|------|
| 광고 로딩으로 인한 CLS 증가 | 0 (광고 슬롯에 min-height 명시) |
| 광고 스크립트 로딩 방식 | `async` + `defer` 속성으로 페이지 렌더링 차단 없음 |
| 광고로 인한 LCP 영향 | LCP 요소가 광고 슬롯이 아닌 콘텐츠 영역이어야 함 |

### 5.2 보안

| 요구사항 | 구현 |
|---------|------|
| 광고-파일 처리 격리 | 광고 스크립트는 `window.__modumark_files` 등 파일 데이터에 접근 불가 |
| CSP 설정 | AdSense 관련 도메인(`googlesyndication.com`, `googletagservices.com`)만 허용 |
| 광고 스크립트 신뢰 | Google AdSense 공식 스크립트만 사용. 서드파티 광고 네트워크 혼용 없음 |

### 5.3 규정 준수

| 요구사항 | 내용 |
|---------|------|
| AdSense 콘텐츠 정책 | 광고 클릭 유도 금지, 광고와 콘텐츠 명확히 구분 |
| 개인정보처리방침 | Google AdSense 사용 사실 및 쿠키 사용 명시. GDPR 옵트아웃 조항 포함 |
| 광고 갱신 빈도 | 분당 최대 2회 (AdSense 정책 준수) |
| GDPR 쿠키 동의 | 최초 방문 시 쿠키 동의 배너 표시, 동의 여부 localStorage 저장 |

### 5.4 SEO 및 콘텐츠 품질

| 요구사항 | 목표 |
|---------|------|
| Lighthouse SEO 점수 | 모든 공개 페이지 90점 이상 |
| 공개 페이지 SSR 콘텐츠 | 각 페이지 800자 이상 고유 텍스트 (JS 미실행 상태에서 크롤러 접근 가능) |
| 가이드 페이지 콘텐츠 | 각 가이드 페이지 1000자 이상 고유 텍스트 |
| 구조화 데이터 | 랜딩(FAQPage), About(Organization) 스키마 적용 |

---

## 6. AdSense 승인 체크리스트

AdSense 광고 게재 유지를 위한 품질 요건:

| 항목 | 요건 | 상태 |
|------|------|------|
| 오리지널 콘텐츠 | 각 공개 페이지에 충분한 오리지널 텍스트 | ✅ 완료 (/, /security, /privacy, /terms 페이지) |
| 개인정보처리방침 | 별도 페이지로 존재 | ✅ 완료 (`/privacy` 페이지) |
| 이용약관 | 별도 페이지로 존재 | ✅ 완료 (`/terms` 페이지) |
| 문의 페이지 | 연락처 또는 문의 양식 | ✅ 완료 |
| 서비스 운영 기간 | 최소 3개월 콘텐츠 운영 권장 | ✅ 충족 (AdSense 승인 완료) |
| 트래픽 품질 | 봇 트래픽 아닌 실제 사용자 방문 | ✅ 충족 (AdSense 승인 완료) |
| 금지 콘텐츠 없음 | 성인, 도박, 저작권 침해 콘텐츠 없음 | ✅ 해당 없음 |
| ads.txt | `/ads.txt` 파일로 퍼블리셔 인증 | ✅ 완료 (`public/ads.txt`) |
| 메타 태그 인증 | `google-adsense-account` 메타 태그 | ✅ 완료 (`layout.tsx` metadata.other) |
| **승인 결과** | **Google AdSense 최종 승인** | **✅ 승인 완료 (ID: `ca-pub-1815575117157423`)** |
| 공개 페이지 SSR 콘텐츠 충분성 | 각 공개 페이지 800자 이상 SSR 텍스트 | 미완료 (Phase 3B) |
| 네비게이션 일관성 | 모든 공개 페이지에서 주요 페이지 접근 가능 | 미완료 (Phase 3A) |
| About/연락처 페이지 존재 | `/about` 페이지에 서비스 소개 + 연락처 | 미완료 (Phase 3B) |
| 쿠키 동의 배너 (GDPR) | CookieConsentBanner 표시, localStorage 동의 저장 | 미완료 (Phase 3A) |
| 가이드 콘텐츠 허브 | /guide 인덱스 + 가이드 5개 이상 | 미완료 (Phase 3C) |

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-07 | 초안 작성 | 프로젝트 오너 |
| v2.0 | 2026-03-08 | Phase 1 완료 반영: MN-M1~M5 완료 표시, FloatingAdSlot 컴포넌트(MN-M2-F) 추가, AdSense ID 환경변수(`ca-pub-placeholder`) 명시, 상태 Active로 변경 | 프로젝트 오너 |
| v2.1 | 2026-03-10 | AdSense 승인 완료 반영: 실제 퍼블리셔 ID(`ca-pub-1815575117157423`) 적용, 승인 체크리스트 전체 완료 처리, ads.txt·메타 태그 항목 추가, 상태 업데이트 | 프로젝트 오너 |
| v3.0 | 2026-03-11 | AdSense 콘텐츠 강화 계획 반영: (1) Must Have에 MN-M7~M19 추가(SiteHeader·SiteFooter·ToolHero·CookieConsentBanner·About 페이지·ToolHero 삽입·PDF 하위 라우트 SSR·GDPR 보강·광고 슬롯 배치·sitemap·구조화 데이터·랜딩 보강), (2) Should Have에 MN-S5~S10 추가(가이드 인덱스·마크다운 기초·PDF 병합·PDF 분할·OCR·단축키 가이드), (3) 사용자 스토리 US-MN-05~07 추가, (4) 비기능 요구사항에 SEO 및 콘텐츠 품질 섹션 추가, (5) AdSense 승인 체크리스트에 콘텐츠 품질 5개 항목 추가 | 프로젝트 오너 |
