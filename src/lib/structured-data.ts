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
