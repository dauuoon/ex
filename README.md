# Fragment of Divergent Meaning

전시장용 인터랙션 웹 애플리케이션

## 사용 방법

1. `index.html` 파일을 웹 브라우저로 열기
2. 모바일 기기에서는 QR 코드로 접속

## 로컬 서버 실행 (선택사항)

Python이 설치되어 있다면:

```bash
# Python 3
python3 -m http.server 8000

# 또는 Python 2
python -m SimpleHTTPServer 8000
```

그 후 브라우저에서 `http://localhost:8000` 접속

## 배포

GitHub Pages, Netlify, Vercel 등의 정적 사이트 호스팅 서비스를 사용하여 배포할 수 있습니다.

QR 코드는 배포된 URL로 생성하면 됩니다.

## 기능

- 3단계 인터랙션 플로우
- A, B, C 세 개의 단어 선택
- 선택한 단어로 구성된 결과물 생성
- 결과물 이미지 저장 (PNG)
- 모바일 최적화 반응형 디자인
