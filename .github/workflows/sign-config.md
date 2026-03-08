# 코드 서명 설정 가이드

## GitHub Secrets 설정

다음 시크릿을 GitHub 레포지토리 Settings > Secrets > Actions에 추가하세요:

| Secret 이름 | 설명 |
|---|---|
| `WINDOWS_CERTIFICATE` | Base64 인코딩된 .pfx 인증서 파일 |
| `WINDOWS_CERTIFICATE_PASSWORD` | 인증서 비밀번호 |

## 인증서 준비

### 상용 인증서 (권장)
- DigiCert, Sectigo 등에서 Code Signing Certificate 구매
- .pfx 파일 내보내기

### 자체 서명 인증서 (개발/테스트용)
```powershell
# PowerShell에서 자체 서명 인증서 생성
$cert = New-SelfSignedCertificate `
  -Subject "CN=ModuMark, O=ModuMark, C=KR" `
  -Type CodeSigningCert `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -HashAlgorithm SHA256

# .pfx 파일로 내보내기
$password = ConvertTo-SecureString -String "your-password" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath modumark.pfx -Password $password

# Base64 인코딩
[Convert]::ToBase64String([IO.File]::ReadAllBytes("modumark.pfx"))
```

## tauri.conf.json 서명 설정

```json
"bundle": {
  "windows": {
    "certificateThumbprint": null,
    "digestAlgorithm": "sha256",
    "timestampUrl": "http://timestamp.digicert.com"
  }
}
```

`certificateThumbprint`는 GitHub Actions에서 환경변수로 주입됩니다.
