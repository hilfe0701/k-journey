/**
 * K-Journey mission catalog — 55 curated missions across 4 phases × 4 categories.
 *
 * Authoring rules:
 *   - English first, Korean proper nouns inside parens: "Try Tteokbokki (떡볶이)"
 *   - Each mission has 3 tips and an optional mapHint
 *   - icon names map to lucide-react-native exports
 *   - phase 1 = pre-arrival, 2 = first week, 3 = living, 4 = pre-departure
 */

import type { ContentEvidence } from '../lib/contentEvidence';

export type MissionCategory = 'settle' | 'food' | 'activity' | 'culture';

export type MissionAppliesTo = 'dormitory' | 'off-campus';
export type MissionActionType = 'official_link' | 'save_place' | 'reservation';

export interface MissionAction {
  type: MissionActionType;
  label: string;
  href: string;
}

export interface MissionSeasonality {
  kind: 'weather' | 'annual_schedule';
  reviewEachYear: true;
  note: string;
}

export interface Mission {
  id: string;
  phase: 1 | 2 | 3 | 4;
  category: MissionCategory;
  titleEn: string;
  titleKo?: string;
  summary: string;
  tips: string[];
  mapHint?: string;
  /** Stable single-place query used for a map action; broader hints do not get one. */
  mapSearchQuery?: string;
  icon: string;
  /** When omitted, the mission applies to both dorm and off-campus students. */
  appliesTo?: MissionAppliesTo;
  /** Observable action that makes this mission complete. */
  completeWhen: string;
  /** Provenance and review state for the guidance in this card. */
  evidence: ContentEvidence;
  /** Accountable editorial role for keeping this card current. */
  owner: string;
  /** Optional direct next steps; completion remains an explicit user action. */
  actions: readonly MissionAction[];
  seasonal?: MissionSeasonality;
}

type MissionDraft = Omit<Mission, 'completeWhen' | 'evidence' | 'owner' | 'actions'>;

const MISSION_DRAFTS: MissionDraft[] = [
  // ═══════════════════════ PHASE 1 — Pre-arrival (9 missions) ═══════════════════════
  {
    id: 'p1_pack',
    phase: 1,
    category: 'settle',
    titleEn: 'Build your packing checklist',
    summary: 'Pack for Korea\'s seasons before you board the plane.',
    tips: [
      'Korean winters drop below freezing. If arriving in fall or winter, pack a real coat.',
      'Bring a 220V plug adapter — Korea uses Type C/F, not the US Type A/B.',
      'Your university may require travel or health coverage before arrival. Confirm the exact policy with its international office.',
    ],
    icon: 'Luggage',
  },
  {
    id: 'p1_visa',
    phase: 1,
    category: 'culture',
    // Legacy ID retained so existing local completion records survive the
    // move away from an administrative task that duplicated Essentials.
    titleEn: 'Prepare a Korean arrival phrase card',
    summary: 'Keep the words you will need during your first hour in Korea close at hand.',
    tips: [
      'Write your campus or accommodation name in Korean so you can show it to a driver or station worker.',
      'Add “여기 어떻게 가요?” (yeogi eotteoke gayo?) — “How do I get here?”',
      'Keep the note offline with 112, 119, and your university contact.',
    ],
    icon: 'Languages',
  },
  {
    id: 'p1_dorm_rules',
    phase: 1,
    category: 'settle',
    titleEn: 'Check dormitory prohibited items',
    summary: 'Each university bans different things. Read your dorm guide.',
    tips: [
      'Most Korean dorms prohibit kettles, induction plates, and rice cookers.',
      'Pets, candles, and incense are commonly restricted; your dorm guide is the final authority.',
      'Some dorms enforce gender-segregated floors with a midnight curfew.',
    ],
    icon: 'Home',
    appliesTo: 'dormitory',
  },
  {
    id: 'p1_offcampus_essentials',
    phase: 1,
    category: 'settle',
    titleEn: 'Plan your off-campus essentials list',
    summary: 'Most short-term apartments come bare. Know what to buy week one.',
    tips: [
      'Bedding is rarely included. Daiso sells full sets for ₩30,000–50,000.',
      'Basic kitchen: one pot, one pan, a rice cooker, chopsticks. ₩60,000 covers it.',
      'Hangers, drying rack, and cleaning supplies — assume zero on day one.',
    ],
    icon: 'PackageOpen',
    appliesTo: 'off-campus',
  },
  {
    id: 'p1_airport',
    phase: 1,
    category: 'settle',
    titleEn: 'Plan airport-to-campus transit',
    summary: 'Incheon (ICN) is 60–90 minutes from most Seoul universities.',
    tips: [
      'AREX Express train goes ICN → Seoul Station in 43 minutes. Buy at the airport counter; the fare has been raised twice since 2023, so read it there.',
      'Airport limousine to central Seoul is ₩18,000 for an adult, ₩12,000 for a child. Check which stop is nearest your campus — the routes serve hotels and districts, not university gates.',
      'Taxi from ICN runs ₩60,000–80,000 with toll. Use Kakao T app.',
    ],
    mapHint: 'Incheon Airport (인천공항) Terminal 1 or 2',
    icon: 'Plane',
  },
  {
    id: 'p1_emergency',
    phase: 1,
    category: 'settle',
    titleEn: 'Save Korean emergency numbers',
    summary: 'Add 112, 119, and 1345 to your phone before you fly.',
    tips: [
      '112 — police. 119 — fire and ambulance. Both have English speakers.',
      '1345 — Immigration & foreign resident hotline (English available).',
      '1330 — Korea Tourism Organization, 24/7 multilingual help line.',
    ],
    icon: 'Phone',
  },
  {
    id: 'p1_apps',
    phase: 1,
    category: 'settle',
    titleEn: 'Download essential Korean apps',
    summary: 'Korea\'s app ecosystem is its own. Install before you land.',
    tips: [
      'KakaoTalk — texting, payments, IDs. Everyone uses it, including landlords.',
      'Naver Map (네이버 지도) — Google Maps barely works for transit. Naver does.',
      'Papago (파파고) — Korean translator, more accurate than Google for Korean.',
    ],
    icon: 'Smartphone',
  },
  {
    id: 'p1_greetings',
    phase: 1,
    category: 'culture',
    titleEn: 'Learn 3 Korean greetings',
    summary: 'A polite phrase opens doors. Memorize three before arrival.',
    tips: [
      '안녕하세요 (annyeong-haseyo) — Hello, polite form. Default greeting.',
      '감사합니다 (gamsa-hamnida) — Thank you. Use everywhere.',
      '죄송합니다 (joesong-hamnida) — Sorry / Excuse me.',
    ],
    icon: 'MessageCircle',
  },
  {
    id: 'p1_weather',
    phase: 1,
    category: 'settle',
    titleEn: 'Check the weather and pack layers',
    summary: 'Seoul has four sharp seasons. Match your wardrobe to your dates.',
    tips: [
      'Spring (Mar–May): mild, but yellow-dust days happen. Pack a mask.',
      'Summer (Jun–Aug): humid 30°C+, monsoon rain in July. Pack an umbrella.',
      'Fall (Sep–Nov): clear, crisp 15°C. The most photogenic season.',
      'Winter (Dec–Feb): -10°C nights. Bring a parka, gloves, hat.',
    ],
    icon: 'CloudSun',
  },

  // ═══════════════════════ PHASE 2 — First week (14 missions) ═══════════════════════
  {
    id: 'p2_tmoney',
    phase: 2,
    category: 'settle',
    titleEn: 'Buy a T-money card (티머니)',
    titleKo: '티머니',
    summary: 'Tap-to-pay public transport. Available at every convenience store.',
    tips: [
      'Available at GS25, CU, and 7-Eleven. Card prices vary by product and seller, so confirm the current price at purchase.',
      'Top up at convenience stores or any subway station kiosk.',
      'Same card works on Seoul subway, buses, and most taxis nationwide.',
    ],
    mapHint: 'Any GS25, CU, or 7-Eleven',
    icon: 'CreditCard',
  },
  {
    id: 'p2_sim',
    phase: 2,
    category: 'settle',
    titleEn: 'Activate a SIM or eSIM',
    summary: 'Local data plan costs ₩30,000–55,000/month for unlimited.',
    tips: [
      'Chingu Mobile and Trevorth offer English-friendly student plans.',
      'For eSIM, scan the QR code from the carrier — no SIM tray needed.',
      'KT, SK Telecom, LG U+ all need your Alien Registration Card eventually.',
    ],
    icon: 'Wifi',
  },
  {
    id: 'p2_arc',
    phase: 2,
    category: 'settle',
    titleEn: 'Save your Korean address',
    titleKo: '한국 주소',
    summary: 'A reusable address note makes taxis, deliveries, and asking for directions easier.',
    tips: [
      'Copy the full road-name address in Korean from your housing document.',
      'Add the building name, room number, and one nearby landmark on separate lines.',
      'Save it offline and avoid posting your full room address publicly.',
    ],
    icon: 'MapPinned',
  },
  {
    id: 'p2_bank',
    phase: 2,
    category: 'culture',
    titleEn: 'Use a Korean self-service kiosk',
    summary: 'Complete one everyday order on a kiosk, with help if you need it.',
    tips: [
      'Look for an English or language button before starting.',
      'Check quantity, options, and the final amount before paying.',
      'If the flow is unclear, ask staff rather than guessing at an allergy or payment option.',
    ],
    icon: 'MonitorSmartphone',
  },
  {
    id: 'p2_dorm_checkin',
    phase: 2,
    category: 'settle',
    titleEn: 'Complete dormitory check-in',
    summary: 'Get your key, WiFi password, and laundry card on day one.',
    tips: [
      'Bring passport copy and your housing assignment email.',
      'Test WiFi before leaving the front desk — dead spots are common.',
      'Take photos of any pre-existing damage to avoid charges at checkout.',
    ],
    icon: 'KeyRound',
    appliesTo: 'dormitory',
  },
  {
    id: 'p2_offcampus_utilities',
    phase: 2,
    category: 'settle',
    titleEn: 'Set up your apartment utilities',
    summary: 'Gas, water, electricity, internet — register them all in week one.',
    tips: [
      'Most landlords transfer the existing accounts on move-in. Confirm the meter readings.',
      'Internet plans run ₩25,000–35,000/month. KT, SK, and LG U+ all install within 3 days.',
      'Set up KakaoPay autopay for utilities — late fees stack fast.',
    ],
    icon: 'Plug',
    appliesTo: 'off-campus',
  },
  {
    id: 'p2_offcampus_laundry',
    phase: 2,
    category: 'settle',
    titleEn: 'Find your nearest coin laundromat',
    summary: 'Many short-term apartments skip the washer. Map the closest 빨래방.',
    tips: [
      'Coin laundromats (빨래방) charge ₩4,000–6,000 per wash, ₩2,000 to dry.',
      'Most run 24/7 with self-service kiosks. Bring 1,000-won bills.',
      'Naver Map keyword "빨래방" lists every laundromat with current operating status.',
    ],
    icon: 'WashingMachine',
    appliesTo: 'off-campus',
  },
  {
    id: 'p2_campus',
    phase: 2,
    category: 'settle',
    titleEn: 'Tour campus and find the essentials',
    summary: 'Library, dining hall, gym, health center — know where they are.',
    tips: [
      'Most campuses have a 24h study lounge — get the access code from your dept.',
      'Cafeterias close by 7pm. Cook or order delivery if you study late.',
      'Locate the nearest pharmacy (약국) and convenience store now, not at 2am.',
    ],
    icon: 'School',
  },
  {
    id: 'p2_grocery',
    phase: 2,
    category: 'settle',
    titleEn: 'Find your nearest mart and convenience store',
    summary: 'Daily food vs weekly groceries — know the difference.',
    tips: [
      'Convenience stores (편의점) — 24/7, expensive but always open.',
      'Marts (마트) — E-mart, Lotte Mart, Homeplus for weekly groceries.',
      'Local marts are cheaper than the big chains for produce.',
    ],
    icon: 'ShoppingCart',
  },
  {
    id: 'p2_recycle',
    phase: 2,
    category: 'settle',
    titleEn: 'Learn Korean recycling rules',
    summary: 'Korea separates trash strictly. Mistakes get fines.',
    tips: [
      'Buy designated 종량제 trash bags — generic bags get rejected.',
      'Food waste goes in a separate bin with a special chip card.',
      'Plastic, paper, glass each need their own bag and pickup day.',
    ],
    icon: 'Recycle',
  },
  {
    id: 'p2_delivery',
    phase: 2,
    category: 'food',
    titleEn: 'Install Baemin (배민) or Coupang Eats',
    titleKo: '배달의민족',
    summary: 'Korea\'s food delivery is among the best in the world.',
    tips: [
      'Baemin — biggest selection, all-Korean interface (use Papago).',
      'Coupang Eats — English option in settings, slightly fewer restaurants.',
      'Minimum order ~₩12,000. Delivery fees ₩2,000–5,000.',
    ],
    icon: 'Bike',
  },
  {
    id: 'p2_first_meal',
    phase: 2,
    category: 'food',
    titleEn: 'Try a campus-area restaurant',
    summary: 'Eat where the locals eat. Lunch sets are ₩7,000–12,000.',
    tips: [
      'Look for places packed with Korean students at 12:30pm — that\'s the signal.',
      'Side dishes (반찬) are free and refillable. Just ask.',
      'Card always works. Cash is rarely needed inside Seoul.',
    ],
    icon: 'Utensils',
  },
  {
    id: 'p2_first_friend',
    phase: 2,
    category: 'culture',
    titleEn: 'Make your first Korean friend',
    summary: 'Buddy programs and language exchanges work. Use them.',
    tips: [
      'Most universities run an exchange-student buddy program — sign up day one.',
      'Tandem and HelloTalk apps connect you with Korean students wanting English.',
      'Cafeteria small talk works: "Where are you from?" is a universal opener.',
    ],
    icon: 'Users',
  },
  {
    id: 'p2_transit',
    phase: 2,
    category: 'settle',
    titleEn: 'Master your campus transit route',
    summary: 'Subway + bus + walking. Know the fastest combo.',
    tips: [
      'Naver Map gives bus arrival times accurate to the second.',
      'Transfer between subway lines is free within 30 minutes.',
      'After 11pm, buses run hourly. Use the night bus (N-bus) lines.',
    ],
    icon: 'Train',
  },

  // ═══════════════════════ PHASE 3 — Living (25 missions) ═══════════════════════
  // Food
  {
    id: 'p3_market',
    phase: 3,
    category: 'food',
    titleEn: 'Eat at a traditional market',
    summary: 'Gwangjang Market (광장시장) is the most famous, but not the only one.',
    tips: [
      'Bindaetteok (mung-bean pancake) and yukhoe (raw beef) are signature dishes.',
      'Tongin Market sells a "lunchbox tour" — exchange tokens for sample dishes.',
      'Cash works better than card at family-run stalls.',
    ],
    mapHint: 'Gwangjang Market (광장시장), Jongno-gu',
    mapSearchQuery: 'Gwangjang Market 광장시장',
    icon: 'Store',
  },
  {
    id: 'p3_streetfood',
    phase: 3,
    category: 'food',
    titleEn: 'Try Korean street food',
    summary: 'Tteokbokki, hotteok, sundae — eat them in winter, by hand.',
    tips: [
      'Tteokbokki (떡볶이) — spicy rice cakes, ₩4,000 a portion.',
      'Hotteok (호떡) — sweet pancake stuffed with brown sugar, only in winter.',
      'Sundae (순대) — blood sausage, often served with liver. Adventurous.',
    ],
    icon: 'Soup',
  },
  {
    id: 'p3_extreme',
    phase: 3,
    category: 'food',
    titleEn: 'Try a daring Korean dish',
    summary: 'Live octopus (산낙지), silkworm pupae (번데기), or stinky bean stew.',
    tips: [
      'Sannakji (산낙지) — chew thoroughly. The suction cups can stick to your throat.',
      'Beondegi (번데기) — silkworm pupae snack, sold in cans at convenience stores.',
      'Cheonggukjang (청국장) — fermented bean stew. Smell first, then commit.',
    ],
    icon: 'Skull',
  },
  {
    id: 'p3_samgyeopsal',
    phase: 3,
    category: 'food',
    titleEn: 'Have samgyeopsal (삼겹살) with friends',
    titleKo: '삼겹살',
    summary: 'Korean BBQ over a charcoal grill. The classic group dinner.',
    tips: [
      'Order 1.5 servings per person. Sides are unlimited.',
      'Wrap pork in lettuce with garlic, ssamjang, and rice — that\'s the bite.',
      'End with cold naengmyeon noodles or kimchi-jjigae stew.',
    ],
    icon: 'Beef',
  },
  {
    id: 'p3_cu_combo',
    phase: 3,
    category: 'food',
    titleEn: 'Master the convenience-store meal',
    summary: 'Triangle kimbap + cup ramen + banana milk — the Korean student lunch.',
    tips: [
      'GS25 has the best gimbap. CU wins for desserts. 7-Eleven for hot food.',
      'Triangle kimbap (삼각김밥) — peel layer 1, then 2, then 3, in order.',
      'Banana Milk (바나나우유) is a national obsession. Get the round bottle.',
    ],
    icon: 'Sandwich',
  },
  {
    id: 'p3_tea',
    phase: 3,
    category: 'food',
    titleEn: 'Visit a traditional tea house',
    summary: 'Insadong (인사동) and Bukchon (북촌) hide hundred-year-old tea rooms.',
    tips: [
      'Order omija-cha (오미자차) — five-flavor tea, served cold or hot.',
      'Tea house rules: take off shoes, sit on the floor, speak softly.',
      'Most close by 8pm. Afternoon visit is best.',
    ],
    mapHint: 'Insadong (인사동), Jongno-gu',
    mapSearchQuery: 'Insadong 인사동',
    icon: 'Coffee',
  },

  // Activity
  {
    id: 'p3_hangang',
    phase: 3,
    category: 'activity',
    titleEn: 'Picnic on the Hangang (한강) with chimaek',
    titleKo: '한강',
    summary: 'Order chicken + beer to a riverside park. Sit on the grass.',
    tips: [
      'Yeouido, Ttukseom, and Banpo parks are the three main picnic spots.',
      'Chicken delivery accepts park GPS pins. Pick a tree as your landmark.',
      'Banpo Bridge fountain show runs nightly in summer (Apr–Oct).',
    ],
    mapHint: 'Yeouido / Ttukseom / Banpo Han River Park',
    seasonal: {
      kind: 'weather',
      reviewEachYear: true,
      note: 'Park conditions, fountain operation, rain, heat, and daylight change by season; check the current park notice and forecast.',
    },
    icon: 'Trees',
  },
  {
    id: 'p3_hike',
    phase: 3,
    category: 'activity',
    titleEn: 'Hike a Seoul mountain',
    summary: 'Bukhansan, Gwanaksan, Inwangsan — the three "in-Seoul" peaks.',
    tips: [
      'Inwangsan (338m) is the easiest and has skyline views.',
      'Bukhansan (836m) is a real hike. Wear real shoes, bring 1L of water.',
      'Trails close at sunset. Start by 1pm at the latest in winter.',
    ],
    mapHint: 'Bukhansan, Gwanaksan, or Inwangsan trailheads',
    seasonal: {
      kind: 'weather',
      reviewEachYear: true,
      note: 'Trail access, fire-risk closures, daylight, heat, and ice are seasonal; check the current park and weather notices.',
    },
    icon: 'Mountain',
  },
  {
    id: 'p3_ktx',
    phase: 3,
    category: 'activity',
    titleEn: 'Take a KTX day trip',
    summary: 'Busan, Gyeongju, Jeonju, Gangneung — all reachable in under 3 hours.',
    tips: [
      'Choose a destination and check the current KORAIL schedule and fare; train, seat class, and travel date determine the price.',
      'Busan, Gyeongju, Jeonju, and Gangneung have different travel times and services, so plan from the live timetable.',
      'Book on KorailTalk or the KORAIL website; check the current eligibility and terms for any foreigner pass.',
    ],
    mapHint: 'Seoul Station (서울역); confirm the current KTX departure track on your ticket',
    mapSearchQuery: 'Seoul Station 서울역',
    icon: 'TrainFront',
  },
  {
    id: 'p3_festival',
    phase: 3,
    category: 'activity',
    titleEn: 'Attend a Korean festival',
    summary: 'Boryeong Mud, Jinhae Cherry Blossom, Busan Fireworks — pick by season.',
    tips: [
      'Spring: Jinhae Cherry Blossom Festival (early April).',
      'Summer: Boryeong Mud Festival (mid-July). Wear clothes you\'ll throw away.',
      'Fall: Busan Fireworks (October), Jeonju Hanok Festival (October).',
    ],
    seasonal: {
      kind: 'annual_schedule',
      reviewEachYear: true,
      note: 'Festival dates and locations are announced each year; choose from the current official calendar rather than these examples.',
    },
    icon: 'Sparkles',
  },
  {
    id: 'p3_jjimjilbang',
    phase: 3,
    category: 'activity',
    titleEn: 'Spend a night at a jjimjilbang (찜질방)',
    titleKo: '찜질방',
    summary: 'Korean bath house — naked baths, hot rooms, sleeping floor.',
    tips: [
      'Dragon Hill Spa and Spa Land Centum City are tourist-friendly.',
      'Bath floors are gender-segregated. Common areas wear matching uniforms.',
      'Eat sikhye (식혜) and a hard-boiled egg — that\'s the jjimjilbang ritual.',
    ],
    icon: 'Sparkle',
  },
  {
    id: 'p3_noraebang',
    phase: 3,
    category: 'activity',
    titleEn: 'Sing at a noraebang (노래방)',
    titleKo: '노래방',
    summary: 'Private karaoke rooms. Cheaper than a movie ticket.',
    tips: [
      'Coin noraebang (코인노래방) — ₩1,000 for 4 songs, no group fee.',
      'Most rooms have an English songbook. Search by artist code.',
      'Service time (서비스) gets added if you wave at the staff.',
    ],
    icon: 'Mic',
  },
  {
    id: 'p3_pcbang',
    phase: 3,
    category: 'activity',
    titleEn: 'Play at a PC bang (피시방)',
    summary: 'Korean PC cafés — high-end gaming for ₩1,500/hour.',
    tips: [
      'Order food from the desk — fried chicken arrives at your station.',
      'Most have League of Legends, Overwatch, StarCraft pre-installed.',
      'Quiet hours after midnight. Daytime crowd is mostly students.',
    ],
    icon: 'Gamepad2',
  },
  {
    id: 'p3_pojangmacha',
    phase: 3,
    category: 'activity',
    titleEn: 'Visit a night market or pojangmacha (포장마차)',
    titleKo: '포장마차',
    summary: 'Tented stalls serving cheap food and soju after dark.',
    tips: [
      'Jongno 3-ga and Hongdae have the largest pojangmacha rows.',
      'Spicy chicken feet (닭발) and soju are the classic pairing.',
      'Open 6pm to 4am. Avoid weekend crowds — go on a Tuesday.',
    ],
    icon: 'Tent',
  },

  // Culture
  {
    id: 'p3_hanbok',
    phase: 3,
    category: 'culture',
    titleEn: 'Wear hanbok (한복) at a palace',
    titleKo: '한복',
    summary: 'Rent a hanbok and visit Gyeongbokgung free of charge.',
    tips: [
      'Hanbok rental is ₩15,000–25,000 for 4 hours, near Gyeongbokgung exit 3.',
      'Wearing hanbok waives admission at Gyeongbokgung, Changdeokgung, Changgyeonggung, Deoksugung and Jongmyo.',
      'Hanbok hair-styling adds ₩5,000 and saves you 30 minutes.',
    ],
    mapHint: 'Gyeongbokgung Palace (경복궁); the palace guide directs subway visitors to Gyeongbokgung Station Exit 5',
    mapSearchQuery: 'Gyeongbokgung Palace 경복궁',
    icon: 'Crown',
  },
  {
    id: 'p3_museum',
    phase: 3,
    category: 'culture',
    titleEn: 'Visit the National Museum of Korea',
    summary: 'Free admission. Plan 3 hours minimum.',
    tips: [
      'The permanent galleries and the Children\'s Museum are free. Special exhibitions are priced one by one — the museum lists the fee with each show.',
      'Audio guide available in English at the front desk.',
      'The Pensive Bodhisattva (반가사유상) hall is a 20-minute meditation.',
    ],
    mapHint: 'Ichon Station (이촌역) Exit 2',
    mapSearchQuery: 'National Museum of Korea 국립중앙박물관',
    icon: 'Building',
  },
  {
    id: 'p3_dojang',
    phase: 3,
    category: 'culture',
    titleEn: 'Get a personal name seal (도장) carved',
    titleKo: '도장',
    summary: 'A traditional Korean name stamp, hand-carved in wood or stone.',
    tips: [
      'Insadong has dozens of seal carvers. Prices ₩20,000–80,000.',
      'Bring your name written in hangul (the carver may not read Latin script).',
      'Wood is cheap and quick. Stone takes 2–3 days but lasts forever.',
    ],
    mapHint: 'Insadong (인사동), Jongno-gu',
    mapSearchQuery: 'Insadong 인사동',
    icon: 'Stamp',
  },
  {
    id: 'p3_templestay',
    phase: 3,
    category: 'culture',
    titleEn: 'Try a templestay',
    summary: 'A weekend at a Buddhist temple — meditation, vegetarian meals, 4am bell.',
    tips: [
      'Book at templestay.go.kr. English programs run year-round.',
      'Pack: warm socks, modest clothes, willingness to wake at 4am.',
      'Phone use is discouraged. Lean into the silence.',
    ],
    icon: 'Flower2',
  },
  {
    id: 'p3_movie',
    phase: 3,
    category: 'culture',
    titleEn: 'Watch a Korean movie in theaters',
    summary: 'CGV and Lotte Cinema show Korean films with English subtitles weekly.',
    tips: [
      '"With English subtitles" is marked as 영자막 in Korean booking apps.',
      'CGV Yongsan IPark has the most English-friendly screenings.',
      'Tuesday Culture Day — half-price tickets at all major chains.',
    ],
    icon: 'Film',
  },
  {
    id: 'p3_kpop',
    phase: 3,
    category: 'culture',
    titleEn: 'See a K-pop or traditional performance',
    summary: 'Music shows tape live in Seoul most weekdays. Free tickets exist.',
    tips: [
      'M Countdown, Music Bank, Show Champion film with live audiences.',
      'Apply via fan-club Twitter accounts 2–3 weeks ahead.',
      'For traditional music: Namsangol Hanok Village hosts daily free performances.',
    ],
    icon: 'Music',
  },

  // Settle (still in living phase)
  {
    id: 'p3_bus_transfer',
    phase: 3,
    category: 'settle',
    titleEn: 'Master the bus transfer system',
    summary: 'Tap on, tap off — the system tracks your route.',
    tips: [
      'Always tap T-money when you exit the bus, even on the last leg.',
      'Within 30 minutes of tap-off, your next bus or subway is free.',
      'Empty seat? Korean elders board first. Stand up if needed.',
    ],
    icon: 'Bus',
  },
  {
    id: 'p3_korean_order',
    phase: 3,
    category: 'settle',
    titleEn: 'Order delivery in Korean',
    summary: 'Reach the level where you don\'t need Papago anymore.',
    tips: [
      'Memorize: 매운 (spicy), 안 매운 (not spicy), 곱빼기 (extra portion).',
      'Most Baemin chats use templates — tap, don\'t type.',
      'When in doubt, take a photo of the menu and ask in Korean class.',
    ],
    icon: 'Soup',
  },
  {
    id: 'p3_cafe',
    phase: 3,
    category: 'settle',
    titleEn: 'Find your study café',
    summary: 'Theme cafés, dessert cafés, 24-hour study cafés — find the one for you.',
    tips: [
      'Study cafés (스터디 카페) charge ₩3,000–5,000/hour with free coffee.',
      'Hongdae and Yeonnam have the densest theme-café scenes.',
      'Most regular cafés expect a ₩6,000+ order to use a table for hours.',
    ],
    icon: 'Coffee',
  },
  {
    id: 'p3_clinic',
    phase: 3,
    category: 'settle',
    titleEn: 'Visit a Korean pharmacy or clinic',
    summary: 'Walk-ins are normal. The system is fast and cheap.',
    tips: [
      'Pharmacies (약국) handle minor issues — cold, fever, headache — without prescription.',
      'Consultation charges and patient co-payments follow current national insurance rules and the clinic type. No fixed amount is shown here — confirm with the clinic or NHIS before treatment.',
      'Severance Hospital (Yonsei) and Asan have foreigner-friendly desks.',
    ],
    icon: 'Stethoscope',
  },
  {
    id: 'p3_cooking',
    phase: 3,
    category: 'settle',
    titleEn: 'Cook one Korean dish at home',
    summary: 'Kimchi-jjigae, bibimbap, or rolled egg — pick something simple.',
    tips: [
      'Kimchi-jjigae needs 4 ingredients: kimchi, pork, tofu, water.',
      'Maangchi.com has reliable recipes for foreigners.',
      'Korean grocery aisles label by category, not brand. Ask staff for help.',
    ],
    icon: 'ChefHat',
  },

  // ═══════════════════════ PHASE 4 — Pre-departure (7 missions) ═══════════════════════
  {
    id: 'p4_customs',
    phase: 4,
    category: 'settle',
    titleEn: 'Check your home country\'s customs limits',
    summary: 'Know what you can and can\'t bring back.',
    tips: [
      'Most countries cap duty-free at $800 USD or equivalent in souvenirs.',
      'Skincare, food, and ginseng count — declare amounts over the cap.',
      'Korean alcohol over 1L often hits a duty even if under cash limit.',
    ],
    icon: 'PackageCheck',
  },
  {
    id: 'p4_gifts',
    phase: 4,
    category: 'settle',
    titleEn: 'Shop your gift list',
    summary: 'Korean cosmetics, snacks, and stationery — the classic souvenirs.',
    tips: [
      'Olive Young — discount cosmetics with English staff in Myeongdong.',
      'Lotte Mart Seoul Station — the foreigner-checkout floor packs gift sets.',
      'Hand-folded hanji notebooks at Insadong run ₩8,000–15,000.',
    ],
    mapHint: 'Myeongdong, Insadong, Lotte Mart Seoul Station',
    icon: 'Gift',
  },
  {
    id: 'p4_pack_out',
    phase: 4,
    category: 'settle',
    titleEn: 'Pack your departure suitcase',
    summary: 'Weigh before you leave the dorm. Don\'t pay airport overweight.',
    tips: [
      'Most international flights cap at 23kg checked, 7kg carry-on.',
      'Mail home a box of clothes via EMS — cheaper than flight overweight fees.',
      'Liquids over 100ml go in checked, not carry-on.',
    ],
    icon: 'Luggage',
  },
  {
    id: 'p4_dorm_out',
    phase: 4,
    category: 'settle',
    titleEn: 'Complete your dorm checkout',
    summary: 'Return key, settle utilities, get your deposit back.',
    tips: [
      'Take photos of every wall and the floor before you hand the key in.',
      'Read the current dorm checkout notice for key return, inspection, cleaning, and final-charge steps.',
      'Ask the dorm office when and how your deposit is paid before you close the account that should receive it.',
    ],
    icon: 'KeyRound',
    appliesTo: 'dormitory',
  },
  {
    id: 'p4_offcampus_lease',
    phase: 4,
    category: 'settle',
    titleEn: 'Close out your apartment lease',
    summary: 'Final readings, deposit refund, and getting rid of your stuff.',
    tips: [
      'Take final meter photos for gas, water, electric the morning you leave.',
      'Large furniture disposal needs a paid pickup sticker from the district office.',
      'Confirm the refund date, deductions, and receiving account with your landlord or broker before handover.',
    ],
    icon: 'KeyRound',
    appliesTo: 'off-campus',
  },
  {
    id: 'p4_farewell',
    phase: 4,
    category: 'culture',
    titleEn: 'Have a farewell dinner with Korean friends',
    summary: 'A proper sendoff. Plan it, don\'t skip it.',
    tips: [
      'Korean friends value the gesture — invite, even if it\'s small.',
      'Pay for one round of drinks. The rest takes care of itself.',
      'Exchange KakaoTalk IDs that work internationally — not just school emails.',
    ],
    icon: 'Heart',
  },
  {
    id: 'p4_last_meal',
    phase: 4,
    category: 'food',
    titleEn: 'Eat your last Korean meal',
    summary: 'The food you\'ll miss most. Pick deliberately.',
    tips: [
      'Most exchange students name samgyeopsal, kimbap, or naengmyeon as the one they miss.',
      'Take a photo of the receipt — these become unexpected souvenirs.',
      'Tip: a fresh hot meal at the airport KTX food court works as a final taste.',
    ],
    icon: 'Utensils',
  },
];

type MissionMetadata = Pick<Mission, 'completeWhen' | 'evidence' | 'owner'>;

const MISSION_OWNER = 'K-Journey Content Operations';
const MISSION_CHECKED_AT = '2026-08-29';

function missionEvidence(
  sourceUrl: string,
  sourceTitle: string,
  publisher: string,
  contentClass: ContentEvidence['contentClass'],
  verification: ContentEvidence['verification'],
  finalAuthority: string,
  jurisdiction?: string,
): ContentEvidence {
  const evidence: ContentEvidence = {
    sourceUrl,
    sourceTitle,
    publisher,
    checkedAt: MISSION_CHECKED_AT,
    contentClass,
    verification,
    finalAuthority,
  };
  if (jurisdiction) evidence.jurisdiction = jurisdiction;
  return evidence;
}

const noPrimarySource = (
  contentClass: ContentEvidence['contentClass'],
  finalAuthority: string,
  jurisdiction?: string,
) =>
  missionEvidence(
    '',
    'No suitable primary source identified',
    'K-Journey Content Operations',
    contentClass,
    'unknown',
    finalAuthority,
    jurisdiction,
  );

const editorialSource = (finalAuthority = 'K-Journey Content Operations') =>
  missionEvidence(
    '',
    'Editorial guidance — no single primary source',
    'K-Journey Content Operations',
    'C',
    'editorial',
    finalAuthority,
  );

const MISSION_METADATA: Record<string, MissionMetadata> = {
  p1_pack: {
    completeWhen: 'A personal packing checklist is drafted for the learner’s arrival season.',
    evidence: noPrimarySource('C', 'your university international office'),
    owner: MISSION_OWNER,
  },
  p1_visa: {
    completeWhen: 'An offline note contains the learner’s Korean destination, one directions phrase, and emergency contacts.',
    evidence: editorialSource('the learner’s university international office'),
    owner: MISSION_OWNER,
  },
  p1_dorm_rules: {
    completeWhen: 'The learner has read the prohibited-items and conduct rules for their assigned dormitory.',
    evidence: noPrimarySource('B', 'your university dormitory office'),
    owner: MISSION_OWNER,
  },
  p1_offcampus_essentials: {
    completeWhen: 'A first-week essentials list is written for the learner’s own apartment.',
    evidence: noPrimarySource('C', 'your landlord or housing provider'),
    owner: MISSION_OWNER,
  },
  p1_airport: {
    completeWhen: 'The learner has saved one airport-to-campus route and a backup route.',
    evidence: missionEvidence(
      'https://www.arex.or.kr/content.do?menuNo=MN201503060000000002',
      'Passenger fares and conditions',
      'Airport Railroad (AREX)',
      'B',
      'needs_review',
      'AREX or the airport limousine/taxi operator for the selected route',
    ),
    owner: MISSION_OWNER,
  },
  p1_emergency: {
    completeWhen: '112, 119, 1345, and 1330 are saved in the learner’s phone.',
    evidence: missionEvidence(
      'https://www.moj.go.kr/moj/196/subview.do',
      'Immigration Contact Center 1345',
      'Ministry of Justice, Republic of Korea',
      'A',
      'needs_review',
      '112, 119, 1345, or 1330 as appropriate',
      'Republic of Korea',
    ),
    owner: MISSION_OWNER,
  },
  p1_apps: {
    completeWhen: 'The learner has installed the navigation, messaging, and translation apps they plan to use.',
    evidence: missionEvidence(
      'https://www.kakaocorp.com/page/service/service/KakaoTalk',
      'KakaoTalk service',
      'Kakao Corp.',
      'C',
      'needs_review',
      'each app provider',
    ),
    owner: MISSION_OWNER,
  },
  p1_greetings: {
    completeWhen: 'The learner can say the three Korean greetings aloud or show them in a note.',
    evidence: missionEvidence(
      'https://www.korean.go.kr/front/page/pageView.do?page_id=P000148&mn_id=99',
      'Revised Romanization of Korean',
      'National Institute of Korean Language',
      'C',
      'editorial',
      'the person the learner is speaking with',
    ),
    owner: MISSION_OWNER,
  },
  p1_weather: {
    completeWhen: 'The learner has checked the forecast for arrival and packed suitable layers.',
    evidence: missionEvidence(
      'https://www.weather.go.kr/w/',
      'Korea weather service',
      'Korea Meteorological Administration',
      'C',
      'needs_review',
      'Korea Meteorological Administration',
    ),
    owner: MISSION_OWNER,
  },
  p2_tmoney: {
    completeWhen: 'A T-money card is purchased and loaded for the learner’s first trip.',
    evidence: missionEvidence(
      'https://english.visitseoul.net/transportation/Transportation-in-Seoul_/6398',
      'Public transportation and T-money purchase information',
      'Seoul Tourism Organization',
      'B',
      'needs_review',
      'Tmoney customer service or the issuing retailer',
    ),
    owner: MISSION_OWNER,
  },
  p2_sim: {
    completeWhen: 'The learner has an active SIM or eSIM and can place a data call or open a web page.',
    evidence: missionEvidence(
      'https://www.kt.com/',
      'KT telecommunications services',
      'KT Corporation',
      'A',
      'needs_review',
      'the selected mobile carrier',
      'Republic of Korea; selected carrier',
    ),
    owner: MISSION_OWNER,
  },
  p2_arc: {
    completeWhen: 'The learner has saved the full Korean road-name address, building details, and a nearby landmark offline.',
    evidence: editorialSource('the learner’s landlord or dormitory office'),
    owner: MISSION_OWNER,
  },
  p2_bank: {
    completeWhen: 'The learner has completed one kiosk order and checked its quantity, options, and final amount.',
    evidence: editorialSource('the venue operating the kiosk'),
    owner: MISSION_OWNER,
  },
  p2_dorm_checkin: {
    completeWhen: 'The learner has received their dorm key and checked the room condition.',
    evidence: noPrimarySource('B', 'your university dormitory office'),
    owner: MISSION_OWNER,
  },
  p2_offcampus_utilities: {
    completeWhen: 'The learner has confirmed meter readings and who holds each utility account.',
    evidence: missionEvidence(
      'https://home.kepco.co.kr/',
      'Korea Electric Power customer services',
      'Korea Electric Power Corporation',
      'B',
      'needs_review',
      'your landlord and each utility provider',
    ),
    owner: MISSION_OWNER,
  },
  p2_offcampus_laundry: {
    completeWhen: 'A nearby laundromat is saved in the learner’s map with its payment method noted.',
    evidence: noPrimarySource('C', 'the laundromat shown in the learner’s map'),
    owner: MISSION_OWNER,
  },
  p2_campus: {
    completeWhen: 'The learner has located the library, dining hall, gym, health center, pharmacy, and convenience store.',
    evidence: noPrimarySource('B', 'your university campus services'),
    owner: MISSION_OWNER,
  },
  p2_grocery: {
    completeWhen: 'One convenience store and one weekly-grocery mart are saved near the learner’s home.',
    evidence: missionEvidence(
      'https://english.visitkorea.or.kr/svc/main/index.do',
      'Visit Korea travel information',
      'Korea Tourism Organization',
      'C',
      'editorial',
      'the store the learner plans to visit',
    ),
    owner: MISSION_OWNER,
  },
  p2_recycle: {
    completeWhen: 'The learner has confirmed their building’s trash bags, food-waste, sorting, and collection rules.',
    evidence: missionEvidence(
      'https://english.seoul.go.kr/',
      'Waste management in Seoul',
      'Seoul Metropolitan Government',
      'B',
      'needs_review',
      'the learner’s district office or building manager',
    ),
    owner: MISSION_OWNER,
  },
  p2_delivery: {
    completeWhen: 'The learner has installed a delivery app and completed a practice order or address setup.',
    evidence: missionEvidence(
      'https://www.baemin.com/',
      'Baemin food delivery service',
      'Woowa Brothers Corp.',
      'C',
      'needs_review',
      'the selected delivery platform',
    ),
    owner: MISSION_OWNER,
  },
  p2_first_meal: {
    completeWhen: 'The learner has eaten one meal at a campus-area restaurant.',
    evidence: editorialSource('the restaurant serving the meal'),
    owner: MISSION_OWNER,
  },
  p2_first_friend: {
    completeWhen: 'The learner has exchanged a greeting and contact method with a Korean peer.',
    evidence: noPrimarySource('C', 'the learner’s university buddy or exchange office'),
    owner: MISSION_OWNER,
  },
  p2_transit: {
    completeWhen: 'The learner has completed and saved their normal campus route using transit and walking.',
    evidence: missionEvidence(
      'https://english.seoul.go.kr/service/movement/',
      'Seoul transportation information',
      'Seoul Metropolitan Government',
      'B',
      'needs_review',
      'the transport operator serving the selected route',
    ),
    owner: MISSION_OWNER,
  },
  p3_market: {
    completeWhen: 'The learner has visited a traditional market and tried one market food.',
    evidence: missionEvidence(
      'https://english.visitkorea.or.kr/svc/contents/infoBscView.do?menuSn=460&vcontsId=140727',
      'Korean food and market travel information',
      'Korea Tourism Organization',
      'C',
      'editorial',
      'the market stall or market management office',
    ),
    owner: MISSION_OWNER,
  },
  p3_streetfood: {
    completeWhen: 'The learner has tried one Korean street food and recorded its Korean name.',
    evidence: missionEvidence(
      'https://english.visitkorea.or.kr/svc/contents/infoBscView.do?menuSn=460&vcontsId=140727',
      'Korean food travel information',
      'Korea Tourism Organization',
      'C',
      'editorial',
      'the vendor serving the food',
    ),
    owner: MISSION_OWNER,
  },
  p3_extreme: {
    completeWhen: 'The learner has made an informed choice to try or skip one adventurous Korean dish.',
    evidence: noPrimarySource('C', 'the restaurant or food vendor serving the dish'),
    owner: MISSION_OWNER,
  },
  p3_samgyeopsal: {
    completeWhen: 'The learner has shared a samgyeopsal meal with at least one friend.',
    evidence: missionEvidence(
      'https://english.visitkorea.or.kr/svc/contents/infoBscView.do?menuSn=460&vcontsId=140727',
      'Korean food travel information',
      'Korea Tourism Organization',
      'C',
      'editorial',
      'the restaurant serving the meal',
    ),
    owner: MISSION_OWNER,
  },
  p3_cu_combo: {
    completeWhen: 'The learner has assembled and eaten a convenience-store meal.',
    evidence: missionEvidence(
      'https://cu.bgfretail.com/',
      'CU convenience store',
      'BGF Retail',
      'C',
      'needs_review',
      'the convenience-store brand and branch',
    ),
    owner: MISSION_OWNER,
  },
  p3_tea: {
    completeWhen: 'The learner has visited a traditional tea house and ordered one tea.',
    evidence: missionEvidence(
      'https://english.visitseoul.net/attractions/Insadong_/255',
      'Insadong travel information',
      'Seoul Tourism Organization',
      'C',
      'editorial',
      'the tea house the learner visits',
    ),
    owner: MISSION_OWNER,
  },
  p3_hangang: {
    completeWhen: 'The learner has spent time at a Hangang park with food or a picnic.',
    evidence: missionEvidence(
      'https://hangang.seoul.go.kr/',
      'Hangang parks guide',
      'Seoul Metropolitan Government',
      'B',
      'needs_review',
      'the relevant Hangang park office',
    ),
    owner: MISSION_OWNER,
  },
  p3_hike: {
    completeWhen: 'The learner has completed a safe hike on a chosen Seoul mountain trail.',
    evidence: missionEvidence(
      'https://english.seoul.go.kr/',
      'Hiking in Seoul',
      'Seoul Metropolitan Government',
      'B',
      'needs_review',
      'the relevant park or trail authority',
    ),
    owner: MISSION_OWNER,
  },
  p3_ktx: {
    completeWhen: 'The learner has completed a KTX day trip or saved a feasible round-trip itinerary.',
    evidence: missionEvidence(
      'https://smart.letskorail.com/ebizbf/EbizBfTicketSearchM.do?hidJobDv=NRM',
      'KORAIL train reservation and fare search',
      'Korea Railroad Corporation (KORAIL)',
      'B',
      'needs_review',
      'KORAIL for the selected train and fare',
    ),
    owner: MISSION_OWNER,
  },
  p3_festival: {
    completeWhen: 'The learner has attended one festival or checked an official schedule for their season.',
    evidence: missionEvidence(
      'https://english.visitkorea.or.kr/',
      'Festivals and events in Korea',
      'Korea Tourism Organization',
      'C',
      'needs_review',
      'the festival’s official organizer',
    ),
    owner: MISSION_OWNER,
  },
  p3_jjimjilbang: {
    completeWhen: 'The learner has visited a jjimjilbang and reviewed its bathing-area etiquette.',
    evidence: missionEvidence(
      'https://english.visitkorea.or.kr/svc/main/index.do',
      'Visit Korea travel information',
      'Korea Tourism Organization',
      'C',
      'editorial',
      'the jjimjilbang the learner visits',
    ),
    owner: MISSION_OWNER,
  },
  p3_noraebang: {
    completeWhen: 'The learner has sung at least one song in a noraebang.',
    evidence: editorialSource('the noraebang the learner visits'),
    owner: MISSION_OWNER,
  },
  p3_pcbang: {
    completeWhen: 'The learner has spent one session at a PC bang and checked its house rules.',
    evidence: editorialSource('the PC bang the learner visits'),
    owner: MISSION_OWNER,
  },
  p3_pojangmacha: {
    completeWhen: 'The learner has visited a pojangmacha or night market and ordered safely.',
    evidence: missionEvidence(
      'https://english.visitkorea.or.kr/svc/main/index.do',
      'Visit Korea travel information',
      'Korea Tourism Organization',
      'C',
      'editorial',
      'the stall or market management office',
    ),
    owner: MISSION_OWNER,
  },
  p3_hanbok: {
    completeWhen: 'The learner has worn a complete hanbok and visited a palace or royal site.',
    evidence: missionEvidence(
      'https://royal.cha.go.kr/ENG/contents/E701000000.do',
      'Free Admission Guidelines for Hanbok Wearers',
      'Royal Palaces and Tombs Center, Cultural Heritage Administration',
      'B',
      'verified',
      'the palace or royal site admission office',
    ),
    owner: MISSION_OWNER,
  },
  p3_museum: {
    completeWhen: 'The learner has visited the National Museum of Korea and one permanent gallery.',
    evidence: missionEvidence(
      'https://www.museum.go.kr/ENG/contents/E0101000000.do',
      'Visitor information and admission fees',
      'National Museum of Korea',
      'B',
      'verified',
      'National Museum of Korea visitor information desk',
    ),
    owner: MISSION_OWNER,
  },
  p3_dojang: {
    completeWhen: 'The learner has ordered or collected a personal name seal.',
    evidence: editorialSource('the seal carver or shop the learner chooses'),
    owner: MISSION_OWNER,
  },
  p3_templestay: {
    completeWhen: 'The learner has completed a templestay booking or attended a templestay program.',
    evidence: missionEvidence(
      'https://www.templestay.com/en/MI000000000000000019/temple/introView.do?templeId=InternationalSeonCenter',
      'Templestay program information',
      'Korean Buddhist Culture and History Foundation',
      'C',
      'verified',
      'the temple hosting the selected program',
    ),
    owner: MISSION_OWNER,
  },
  p3_movie: {
    completeWhen: 'The learner has watched a Korean film in a theater and checked the subtitle label.',
    evidence: missionEvidence(
      'https://www.cgv.co.kr/',
      'CGV cinema booking',
      'CJ CGV',
      'C',
      'needs_review',
      'the cinema chain and theater showing the film',
    ),
    owner: MISSION_OWNER,
  },
  p3_kpop: {
    completeWhen: 'The learner has attended a K-pop or traditional performance, live or streamed by its official venue.',
    evidence: missionEvidence(
      'https://english.seoul.go.kr/',
      'Seoul performance information',
      'Seoul Metropolitan Government',
      'C',
      'needs_review',
      'the performance organizer or venue',
    ),
    owner: MISSION_OWNER,
  },
  p3_bus_transfer: {
    completeWhen: 'The learner has completed a bus-to-transit transfer and confirmed the tap-out step.',
    evidence: missionEvidence(
      'https://english.seoul.go.kr/service/movement/',
      'Seoul transportation information',
      'Seoul Metropolitan Government',
      'B',
      'needs_review',
      'the transport operator serving the journey',
    ),
    owner: MISSION_OWNER,
  },
  p3_korean_order: {
    completeWhen: 'The learner has placed one delivery order using at least one Korean food term.',
    evidence: editorialSource('the delivery platform and restaurant'),
    owner: MISSION_OWNER,
  },
  p3_cafe: {
    completeWhen: 'The learner has selected and visited a study café that fits their schedule and budget.',
    evidence: editorialSource('the study café the learner visits'),
    owner: MISSION_OWNER,
  },
  p3_clinic: {
    completeWhen: 'The learner has identified a nearby pharmacy or clinic and saved its contact details.',
    evidence: missionEvidence(
      'https://www.mohw.go.kr/board.es?mid=a10409020000&bid=0026&list_no=1487937',
      'National health insurance medical-service fee notice',
      'Ministry of Health and Welfare',
      'B',
      'needs_review',
      'the clinic, NHIS, and Ministry of Health and Welfare',
      'Republic of Korea; selected provider',
    ),
    owner: MISSION_OWNER,
  },
  p3_cooking: {
    completeWhen: 'The learner has cooked one Korean dish and recorded the ingredients used.',
    evidence: missionEvidence(
      'https://www.maangchi.com/',
      'Korean cooking recipes',
      'Maangchi',
      'C',
      'editorial',
      'the recipe author and the ingredient packaging',
    ),
    owner: MISSION_OWNER,
  },
  p4_customs: {
    completeWhen: 'The learner has checked the customs allowance for their destination country.',
    evidence: missionEvidence(
      'https://customs.go.kr/english/main.do?hs=100700',
      'Korea Customs Service information',
      'Korea Customs Service',
      'A',
      'needs_review',
      'the customs authority of the destination country',
      'destination country',
    ),
    owner: MISSION_OWNER,
  },
  p4_gifts: {
    completeWhen: 'The learner has purchased or intentionally skipped each item on their gift list.',
    evidence: missionEvidence(
      'https://english.visitkorea.or.kr/svc/main/index.do',
      'Visit Korea shopping information',
      'Korea Tourism Organization',
      'C',
      'needs_review',
      'the retailer and product label',
    ),
    owner: MISSION_OWNER,
  },
  p4_pack_out: {
    completeWhen: 'The learner has weighed their bags and checked the selected airline’s allowance.',
    evidence: noPrimarySource('B', 'the learner’s airline'),
    owner: MISSION_OWNER,
  },
  p4_dorm_out: {
    completeWhen: 'The learner has completed the dormitory’s key-return and room-inspection process.',
    evidence: noPrimarySource('B', 'your university dormitory office'),
    owner: MISSION_OWNER,
  },
  p4_offcampus_lease: {
    completeWhen: 'The learner has recorded final meters and confirmed the lease close-out and deposit process.',
    evidence: noPrimarySource(
      'A',
      'your landlord, broker, and district office',
      'property jurisdiction and district',
    ),
    owner: MISSION_OWNER,
  },
  p4_farewell: {
    completeWhen: 'The learner has arranged or attended a farewell with Korean friends.',
    evidence: editorialSource('the people attending the farewell'),
    owner: MISSION_OWNER,
  },
  p4_last_meal: {
    completeWhen: 'The learner has chosen and eaten the Korean meal they want to remember.',
    evidence: editorialSource('the restaurant or food vendor serving the meal'),
    owner: MISSION_OWNER,
  },
};

const RESERVATION_MISSIONS = new Set(['p3_ktx', 'p3_festival', 'p3_templestay', 'p3_performance']);

export const MISSIONS: Mission[] = MISSION_DRAFTS.map((mission) => {
  const metadata = MISSION_METADATA[mission.id];
  if (!metadata) throw new Error(`Missing metadata for mission ${mission.id}`);
  return { ...mission, ...metadata, actions: missionActions(mission, metadata.evidence) };
});

function missionActions(
  mission: MissionDraft,
  evidence: ContentEvidence,
): readonly MissionAction[] {
  const actions: MissionAction[] = [];
  if (mission.mapSearchQuery) {
    actions.push({
      type: 'save_place',
      label: 'Search this place in Naver Map',
      href: `https://map.naver.com/p/search/${encodeURIComponent(mission.mapSearchQuery)}`,
    });
  }
  if (evidence.sourceUrl) {
    const reservation = RESERVATION_MISSIONS.has(mission.id);
    actions.push({
      type: reservation ? 'reservation' : 'official_link',
      label: reservation ? 'Check the official schedule or reservation' : 'Open the official guide',
      href: evidence.sourceUrl,
    });
  }
  return actions;
}

// Convenience selectors
export const missionsByPhase = (phase: 1 | 2 | 3 | 4) => MISSIONS.filter((m) => m.phase === phase);
export const missionById = (id: string) => MISSIONS.find((m) => m.id === id);
export const missionCount = MISSIONS.length;

/**
 * Filter the catalog to the missions that apply to a given housing arrangement.
 * `appliesTo === undefined` is treated as universal. `housing === null`
 * (e.g., during onboarding) returns the full catalog so the user sees a stable
 * count; runtime filtering kicks in once the profile is set.
 */
export function missionsForHousing(
  housing: MissionAppliesTo | null | undefined,
  phase?: 1 | 2 | 3 | 4,
): Mission[] {
  return MISSIONS.filter((m) => {
    if (phase !== undefined && m.phase !== phase) return false;
    if (!housing) return true;
    if (m.appliesTo === undefined) return true;
    return m.appliesTo === housing;
  });
}
