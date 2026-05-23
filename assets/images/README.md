# Image assets — what goes where

이 폴더는 **앱 자체의 시각 정체성** PNG 5장이 들어올 자리입니다.

병풍 패널 / 버킷 템플릿 / 시대별 일러스트 등 다른 자산은 **여기에 들어오지 않음** —
`assets/byeongpung/`, `assets/bucket-templates/` 별도 폴더로 분리됩니다.

> **📌 진짜 작업 브리프는 프로젝트 루트의 [`AI_IMAGE_PROMPTS.md`](../../AI_IMAGE_PROMPTS.md).**
> 이 README는 사양 빠른 참조용. 실제 디자인 결정·프롬프트·팀 분담은 모두 그쪽.

---

## 필수 이미지 (앱 아이덴티티 5장)

| 파일명 | 크기 | 형식 | 용도 |
|---|---|---|---|
| `icon.png` | 1024 × 1024 | PNG (불투명) | iOS/Android 공용 앱 아이콘 |
| `splash.png` | 1242 × 2436 | PNG | OS 콜드스타트 스플래시. 한지색 #FDFAF3 배경 |
| `adaptive-icon.png` | 1024 × 1024 | PNG (외곽 투명) | Android 13+ 적응형 아이콘 전경. 안쪽 432×432 안전영역 |
| `favicon.png` | 48 × 48 | PNG | 웹 빌드 (선택) |
| `notification-icon.png` | 96 × 96 | PNG (흰색 실루엣 + 투명) | Android 알림 상태바 |

**디자인**: 도장(印) 사각 + 흰색 K 전서체 + 단청적색 #C5302A 바탕 (자세한 사양은 위 브리프 참조).

---

## 무드보드 이미지는 어디로 갔나

`assets/_moodboard/`로 이동했습니다 (2026-05-08).

원래 이 폴더에 있던 6장의 디자인 핸드오프 레퍼런스(minhwa, hwalot, hanbok 시리즈)는
코드에서 한 번도 참조되지 않으며 사용자에게 노출되지 않습니다 (CLAUDE.md NEVER #8 —
사진 위 텍스트 금지). 무드보드용으로만 보관 중.

---

## 자산 도착 후 해야 할 작업

5장 모두 이 폴더에 들어오면 `app.json`에 다음 블록 추가:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FDFAF3"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FDFAF3"
      }
    },
    "plugins": [
      ["expo-notifications", {
        "icon": "./assets/images/notification-icon.png",
        "color": "#C5302A",
        "defaultChannel": "default"
      }]
    ]
  }
}
```

(`expo-notifications` 블록은 이미 있으므로 `icon` 필드만 추가하면 됨.)

이후 `npx expo prebuild --clean` 실행 후 시뮬레이터 검증.
