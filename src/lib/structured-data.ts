export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ModuMark",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web, Windows",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    description: "무료 마크다운 WYSIWYG 편집기 + PDF 통합 도구",
    url: "https://modumark.app",
    featureList: [
      "마크다운 WYSIWYG 편집",
      "PDF 병합",
      "PDF 분할",
      "PDF OCR",
      "로컬 파일 처리",
    ],
  };
}

export function generateFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "ModuMark는 무료인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "네, ModuMark의 모든 핵심 기능은 완전 무료입니다. 유료 구독이나 숨겨진 비용 없이 마크다운 편집, PDF 병합·분할·OCR 등 모든 기능을 이용할 수 있습니다. 서비스는 Google AdSense 광고 수익으로 운영됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "파일이 외부 서버로 전송되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "아니요. ModuMark의 모든 파일 처리는 사용자의 브라우저 안에서만 이루어집니다. 마크다운 파일 편집, PDF 병합·분할·변환·OCR 등 어떤 작업도 외부 서버로 데이터가 전송되지 않습니다. 개인 문서와 기밀 자료를 안심하고 처리할 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "어떤 파일 형식을 지원하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "마크다운(.md) 파일의 WYSIWYG 편집 및 저장, PDF 파일의 병합·분할·OCR 텍스트 추출을 지원합니다. 마크다운 파일을 PDF로 변환(내보내기)하는 기능도 제공합니다.",
        },
      },
    ],
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ModuMark",
    url: "https://modumark.app",
    description: "무료 마크다운 편집기 + PDF 통합 도구 제공 서비스",
    email: "modu.markdown@gmail.com",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "modu.markdown@gmail.com",
    },
  };
}
