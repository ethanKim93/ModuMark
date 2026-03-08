# Monetization 도메인 PRD
# ModuMark - 수익화 제품 요구사항

| 항목 | 내용 |
|------|------|
| 문서 버전 | v2.0 |
| 작성일 | 2026-03-07 |
| 상위 문서 | [docs/PRD.md](../PRD.md) · [docs/monetization/BRD.md](./BRD.md) |
| 상태 | Active (Phase 1 완료, AdSense ID 교체 대기) |

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
| MN-M1 | AdSense 스크립트 통합 | `layout.tsx`에 AdSense 스크립트 async 로딩 ✅ Phase 1 완료 (`NEXT_PUBLIC_ADSENSE_ID=ca-pub-placeholder`, 승인 후 교체 필요) |
| MN-M2 | 광고 슬롯 컴포넌트 | `<AdSlot />` 재사용 가능 컴포넌트 ✅ Phase 1 완료 (`components/ads/AdSlot.tsx`) |
| MN-M2-F | FloatingAdSlot 컴포넌트 | 플로팅 광고 슬롯 컴포넌트 ✅ Phase 1 완료 (`components/ads/FloatingAdSlot.tsx`) |
| MN-M3 | Lazy Loading | 광고 슬롯이 뷰포트 진입 시 로딩 (Intersection Observer API) ✅ Phase 1 완료 |
| MN-M4 | CLS 방지 | 광고 슬롯에 명시적 min-height 설정으로 레이아웃 이동 방지 ✅ Phase 1 완료 |
| MN-M5 | 웹 전용 노출 | `isTauriApp()` 확인 후 광고 컴포넌트 렌더링. Tauri 앱에서 미노출 ✅ Phase 1 완료 |
| MN-M6 | 광고 정책 설정 | AdSense 정책 센터에서 성인·도박 등 부적절 카테고리 차단 |

### Should Have

| 기능 ID | 기능 | 설명 |
|---------|------|------|
| MN-S1 | Ad Blocker 감지 | 광고 차단기 사용 여부 감지 |
| MN-S2 | Ad Blocker 안내 | 감지 시 비폭력적 안내 배너 표시 (기능 차단 없음) |
| MN-S3 | 모바일 광고 숨김 | 375px 미만 화면에서 광고 슬롯 자동 숨김 |
| MN-S4 | 광고 실패 처리 | 광고 로딩 실패 시 슬롯 공간 제거, 레이아웃 복구 |

### Could Have

| 기능 ID | 기능 | 설명 |
|---------|------|------|
| MN-C1 | 광고 배치 A/B 테스트 | Phase 2: 위치별 CTR 비교 |
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
      {/* data-ad-client: process.env.NEXT_PUBLIC_ADSENSE_ID (현재 ca-pub-placeholder, AdSense 승인 후 실제 ID로 교체) */}
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
| 개인정보처리방침 | Google AdSense 사용 사실 및 쿠키 사용 명시 |
| 광고 갱신 빈도 | 분당 최대 2회 (AdSense 정책 준수) |

---

## 6. AdSense 승인 체크리스트

AdSense 승인을 위한 사전 요건:

| 항목 | 요건 | 상태 |
|------|------|------|
| 오리지널 콘텐츠 | 각 공개 페이지에 충분한 오리지널 텍스트 | 소개·가이드 페이지 작성 필요 |
| 개인정보처리방침 | 별도 페이지로 존재 | 작성 필요 |
| 이용약관 | 별도 페이지로 존재 | 작성 필요 |
| 문의 페이지 | 연락처 또는 문의 양식 | 작성 필요 |
| 서비스 운영 기간 | 최소 3개월 콘텐츠 운영 권장 | 출시 후 진행 |
| 트래픽 품질 | 봇 트래픽 아닌 실제 사용자 방문 | 출시 후 확인 |
| 금지 콘텐츠 없음 | 성인, 도박, 저작권 침해 콘텐츠 없음 | 해당 없음 |

---

## 문서 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-07 | 초안 작성 | 프로젝트 오너 |
| v2.0 | 2026-03-08 | Phase 1 완료 반영: MN-M1~M5 완료 표시, FloatingAdSlot 컴포넌트(MN-M2-F) 추가, AdSense ID 환경변수(`ca-pub-placeholder`) 명시, 상태 Active로 변경 | 프로젝트 오너 |
