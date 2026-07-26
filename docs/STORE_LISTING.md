# Store listing copy & asset checklist

> ⛔ **(legacy — not injected into harness steps by default.)** account-bound progress, "sign-in required", and the reviewer credentials contradict `DEC-001`. Store submission is out of scope for this pass anyway. Basis: `CLAUDE.md` Decision precedence · `.work/pmjob/k-journey/45-k-journey-adr-dec-reconciliation-2026-07-27.md` (2026-07-27).

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
- Works offline; your progress is bound to your account, so it follows you to a
  new phone.

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
| Feature graphic | 1024×500 PNG/JPG, no alpha | ❌ Needs design — required by Play. Use the 도장 seal on hanji per `DESIGN.md` |
| Phone screenshots | 2–8, 16:9 or 9:16, ≥ 320px | ❌ Capture once a build runs (home phases, mission complete, byeongpung, gallery) |
| 7" / 10" tablet shots | optional | App is phone-only (`supportsTablet: false`) — skip |
| Promo video | optional (YouTube URL) | Skip for v1 |

## Other listing requirements (Play)
- **Privacy policy URL** — host `docs/PRIVACY_POLICY.md` and paste the URL.
- **Data safety** — fill from `docs/PLAY_DATA_SAFETY.md`.
- **App access** — sign-in required; provide **demo Apple/Google test credentials**
  (or note the `[Dev] Skip auth` build) so reviewers can get past the auth wall.
  ⚠️ Reviewers cannot review behind a login without this — common rejection cause.
- **Contact details** — support email + (optional) website.
