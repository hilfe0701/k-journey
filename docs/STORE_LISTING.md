# Store listing copy & asset checklist

> Current local-first draft. Store submission remains blocked on final legal,
> device, signed-artifact, listing-asset, and operator approval gates.

> Source copy for **Google Play Console → Store listing** (and reusable for App
> Store Connect). Voice follows `docs/MICROCOPY.md`: English-first, sentence
> case, no emoji (CLAUDE.md NEVER #3), Korean parenthetical for proper nouns.
> Character limits noted are Play's.

## Text fields

### App name (≤ 30 chars)
```
K-Journey
```

### Short description (≤ 80 chars)
```
Paint your semester in Korea into a byeongpung (병풍) folding screen.
```
Korean (for the `ko-KR` listing):
```
한국에서의 한 학기를 병풍 한 폭으로 완성하세요.
```

### Full description (≤ 4000 chars)
```
K-Journey turns your exchange semester in Korea into a keepsake.

Every "have to" you finish and every "want to" you check off paints one more
panel of your own byeongpung (병풍) — a traditional Korean folding screen. By the
time you fly home, you have an eight-panel artwork of the four months you spent
here.

How it works
- Follow a four-phase journey: pre-arrival, first week, living, and the run-up to
  departure. The app knows where you are from your dates and shows what matters now.
- Tick off curated missions — practical ones like opening a bank account or
  getting a transit card, and joyful ones like trying tteokbokki (떡볶이) at
  Gwangjang Market (광장시장).
- Add your own wishlist of places and dishes you want to reach.
- Watch your byeongpung fill in, panel by panel, in one of three art eras —
  Joseon, Silla, or Goryeo.
- When your journey ends, open your gallery and share the screen you painted.

Built for international students
- University-specific tips for campuses in Seoul.
- A D-Day counter and gentle, behavior-based reminders — never daily spam.
- An emergency guide for the moments you need it.
- Works offline; your progress stays on this device and can be exported as a
  readable snapshot from Settings.

K-Journey is curation, not a checklist app. It is the souvenir you make by
simply living your semester well.
```

Korean full description: translate the above for `ko-KR`, keeping proper nouns in
the `English (한국어)` form and the same sentence-case, emoji-free voice.

### App Store keywords (≤ 100 chars, iOS only)
```
korea,exchange,study abroad,seoul,student,byeongpung,semester,travel,bucket list,minhwa
```

## Categorization
- **Play category:** Travel & Local (primary). Alternative: Education.
- **App Store category:** Travel (primary), Education (secondary).
- **Content rating:** Everyone / 4+ (no objectionable content). Complete the
  IARC questionnaire — expect "Everyone."
- **Tags / audience:** university students / travelers; not directed at children.

## Graphics checklist

| Asset | Spec | Status |
|---|---|---|
| Hi-res app icon | 512×512 PNG (32-bit) | ✅ Generated → `store-assets/play-store-icon-512.png` (verify it reads as opaque) |
| Feature graphic | 1024×500 PNG/JPG, no alpha | ✅ Draft generated → `store-assets/play-feature-graphic-1024x500-v1.png` (human brand/cultural approval pending) |
| Phone screenshots | 2–8, 16:9 or 9:16, ≥ 320px | ❌ Capture once a build runs (home phases, mission complete, byeongpung, gallery) |
| 7" / 10" tablet shots | optional | App is phone-only (`supportsTablet: false`) — skip |
| Promo video | optional (YouTube URL) | Skip for v1 |

## Other listing requirements (Play)
- **Privacy policy URL** — host `docs/PRIVACY_POLICY.md` and paste the URL.
- **Data safety** — fill from `docs/PLAY_DATA_SAFETY.md`.
- **App access** — no account or sign-in is required. Reviewers can complete the
  local onboarding directly; provide concise review notes for reaching each tab
  and resetting local data.
- **Contact details** — support email + (optional) website.
