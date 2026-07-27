/**
 * Seoul universities supported in the K-Journey MVP.
 * Each record carries the campus-specific guidance that varies between schools:
 * street address, dormitory rules, neighborhood food spots, and the several
 * ways to actually get to class.
 */

export type HousingType = 'dormitory' | 'off-campus';

export interface UniversityHousingRule {
  prohibited: string[];
  checkin: string;
  curfew?: string;
  laundry?: string;
}

export type UniversityVerificationStatus = 'verified' | 'latest_unverified';

export interface UniversityVerification {
  status: UniversityVerificationStatus;
  sourceUrl: string;
  sourceLabel: string;
  checkedAt: string | null;
  finalAuthority: string;
  note: string;
}

export interface University {
  id: string;
  nameEn: string;
  nameKo: string;
  shortName: string;
  address: string;
  campusArea: string;
  nearestStation: string;
  dorm: UniversityHousingRule;
  offCampusArea: string[];
  nearbyEats: string[];
  /** Several ways to reach campus — subway, bus, shuttle, walk, taxi. */
  transitRoutes: string[];
  verification: UniversityVerification;
}

export const UNIVERSITIES: University[] = [
  {
    id: 'cau',
    verification: {
      status: 'verified',
      sourceUrl: 'https://oia.cau.ac.kr/cauoia/exchange/visa.do',
      sourceLabel: 'Chung-Ang University OIA visa and immigration guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Chung-Ang University Office of International Affairs',
      note: 'Official source checked for current exchange-student immigration guidance; campus lifestyle details remain university-specific.',
    },
    nameEn: 'Chung-Ang University',
    nameKo: '중앙대학교',
    shortName: 'Chung-Ang',
    address: '84 Heukseok-ro, Dongjak-gu, Seoul (서울 동작구 흑석로 84)',
    campusArea: 'Heukseok (흑석)',
    nearestStation: 'Heukseok Station (흑석역) Line 9',
    dorm: {
      prohibited: ['Personal cooking', 'Pets', 'Alcohol in rooms', 'Smoking'],
      checkin:
        'Bluemir Hall (블루미르홀) — buildings 308 (308관) and 309 (309관). Check in at the residence front desk with your passport and assignment letter.',
      curfew: 'Curfew 1am–5am (main entrance locked). Open 24 hours during exam periods.',
      laundry: 'Coin laundry — ₩1,500 per wash.',
    },
    offCampusArea: ['Heukseok (흑석)', 'Sangdo (상도)', 'Noryangjin (노량진)'],
    nearbyEats: ['Heukseok Toast', 'Sangdo Sutbul Galbi', 'Cafe Tap Public'],
    transitRoutes: [
      'Subway — Heukseok Station (흑석역) Line 9, Exit 1, then 8–10 min walk uphill.',
      'Campus shuttle — Free shuttle from Heukseok Station Exit 1, every ~10 min on class days (skips the hill).',
      'Village bus — Dongjak 01 (동작01) from Heukseok Station runs up into campus.',
      'Bus — Buses along Hyeonchung-ro (현충로); get off at Chung-Ang Univ. and walk up.',
      'Taxi — about 5 min from Heukseok Station; say "Jung-ang-dae jeongmun" (중앙대 정문).',
    ],
  },
  {
    id: 'yonsei',
    verification: {
      status: 'verified',
      sourceUrl: 'https://gosc.yonsei.ac.kr/gosc/visa/maintaining.do',
      sourceLabel: 'Yonsei University Global One-Stop Service Center guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Yonsei University Office of International Affairs',
      note: 'Official source checked for current residence-card and group-application guidance; semester dates can change.',
    },
    nameEn: 'Yonsei University',
    nameKo: '연세대학교',
    shortName: 'Yonsei',
    address: '50 Yonsei-ro, Seodaemun-gu, Seoul (서울 서대문구 연세로 50)',
    campusArea: 'Sinchon (신촌)',
    nearestStation: 'Sinchon Station (신촌역) Line 2',
    dorm: {
      prohibited: ['Kettles', 'Induction plates', 'Rice cookers', 'Pets', 'Candles'],
      checkin: 'SK Global House front desk, 9am–9pm. Bring passport and assignment letter.',
      curfew: 'No curfew, but main entrance locks 1am–5am (use side entry with student ID).',
      laundry: 'Laundry card from B1 vending machine. Coin top-up at the front desk.',
    },
    offCampusArea: ['Sinchon (신촌)', 'Hongdae (홍대)', 'Yeonnam-dong (연남동)'],
    nearbyEats: ['Hongik Sutbul Galbi', 'Yeonnam Bansangye', 'Cafe 906'],
    transitRoutes: [
      'Subway — Sinchon Station (신촌역) Line 2, Exit 3, then 7–10 min walk up Yonsei-ro.',
      'Subway — Sinchon Station (신촌역, Gyeongui–Jungang Line) is a little closer to the west gate.',
      'Bus — 7611, 7017 or 5712 stop right at the Yonsei main gate.',
      'Walk — about 10 min straight up the pedestrian street from Sinchon Station.',
    ],
  },
  {
    id: 'korea',
    verification: {
      status: 'verified',
      sourceUrl: 'https://gsc.korea.ac.kr/gsc/ExchangeVisitingProgram/Visa_Immigration/Visa/Visa.do',
      sourceLabel: 'Korea University Global Service Center visa guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Korea University Global Service Center',
      note: 'Official source checked for exchange and visiting-student residence-card guidance; fees and extra documents can vary by route.',
    },
    nameEn: 'Korea University',
    nameKo: '고려대학교',
    shortName: 'Korea',
    address: '145 Anam-ro, Seongbuk-gu, Seoul (서울 성북구 안암로 145)',
    campusArea: 'Anam-dong (안암동)',
    nearestStation: 'Korea Univ. Station (고려대역) Line 6',
    dorm: {
      prohibited: ['Hot plates', 'Microwaves (in some halls)', 'Pets', 'Smoking on premises'],
      checkin: 'CJ International House lobby. Photo ID and passport required.',
      curfew: 'No curfew at the international dorm. Some Korean-only halls lock at 1am.',
      laundry: 'Coin laundry on each floor, ₩1,000 per wash.',
    },
    offCampusArea: ['Anam (안암)', 'Jegi-dong (제기동)', 'Bomun-dong (보문동)'],
    nearbyEats: ['Yeongnam Bunsik', 'Anam Sutbul Garden', 'Café Ona'],
    transitRoutes: [
      'Subway — Korea Univ. Station (고려대역) Line 6, Exit 1 or 3, then 5 min walk.',
      'Subway — Anam Station (안암역) Line 6 is closer to the Medical campus and CJ House.',
      'Shuttle — Free shuttle from Korea Univ. Station to the main gate, 8am–7pm.',
      'Bus — Local buses along Anam-ro stop near the main gate.',
    ],
  },
  {
    id: 'snu',
    verification: {
      status: 'verified',
      sourceUrl: 'https://oga.snu.ac.kr/residence-card',
      sourceLabel: 'Seoul National University OGA Residence Card guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Seoul National University Office of Global Affairs',
      note: 'Official source checked for exchange and visiting-student residence-card guidance; current fees may differ by service route.',
    },
    nameEn: 'Seoul National University',
    nameKo: '서울대학교',
    shortName: 'SNU',
    address: '1 Gwanak-ro, Gwanak-gu, Seoul (서울 관악구 관악로 1)',
    campusArea: 'Gwanak-gu (관악구)',
    nearestStation: 'Seoul Nat\'l Univ. Station (서울대입구역) Line 2',
    dorm: {
      prohibited: ['Hot plates', 'Open flame cooking', 'Pets', 'Drinking in rooms'],
      checkin: 'Gwanak Residence Halls main office, 9am–6pm.',
      curfew: 'Main gate of dormitory area closes 12am. Use ID at side gate after.',
      laundry: 'Communal laundry rooms with card system, ₩1,500 per wash.',
    },
    offCampusArea: ['Sillim-dong (신림동)', 'Bongcheon-dong (봉천동)', 'Seoul Nat\'l University Entrance'],
    nearbyEats: ['Sillim Sundae Town', 'Aedo Bunsik', 'The Coffee Bean & Tea Leaf SNU'],
    transitRoutes: [
      'Subway + bus — Seoul Nat\'l Univ. Station (서울대입구역) Line 2, Exit 3, then bus 5511 or 5513 (~20 min; campus is far from the station).',
      'Bus — Green buses 5511, 5513 and 5516 run deep into the large hillside campus.',
      'Walk — Only if you are right by the main gate; the campus is big and steep, so buses are better.',
      'Taxi — about 10 min from the station to the main gate or your building.',
    ],
  },
  {
    id: 'skku',
    verification: {
      status: 'latest_unverified',
      sourceUrl: '',
      sourceLabel: 'Not confirmed (미확인)',
      checkedAt: null,
      finalAuthority: 'Sungkyunkwan University international office',
      note: 'No current official source was verified in this audit. Keep this record as reference information only.',
    },
    nameEn: 'Sungkyunkwan University',
    nameKo: '성균관대학교',
    shortName: 'SKKU',
    address: '25-2 Sungkyunkwan-ro, Jongno-gu, Seoul (서울 종로구 성균관로 25-2)',
    campusArea: 'Hyehwa (혜화)',
    nearestStation: 'Hyehwa Station (혜화역) Line 4',
    dorm: {
      prohibited: ['Cooking appliances', 'Pets', 'Overnight visitors', 'Alcohol in rooms'],
      checkin: 'M-Stay International Dormitory front desk, 24h check-in available.',
      curfew: 'No curfew. Card access required after 11pm.',
      laundry: 'Each floor has paid washers and dryers (card top-up).',
    },
    offCampusArea: ['Hyehwa (혜화)', 'Daehakno (대학로)', 'Myeongnyun-dong (명륜동)'],
    nearbyEats: ['Hyehwa Tteok-bokki Alley', 'Maple Tree House', 'Myeongnyun Jinsa Galbi'],
    transitRoutes: [
      'Subway — Hyehwa Station (혜화역) Line 4, Exit 1, then 10 min walk uphill.',
      'Village bus — Jongno 02 (종로02) from Hyehwa Station runs up to the campus.',
      'Walk — about 10–12 min uphill from Hyehwa Station through Daehakno (대학로).',
    ],
  },
  {
    id: 'hanyang',
    verification: {
      status: 'verified',
      sourceUrl: 'https://oia.hanyang.ac.kr/visa',
      sourceLabel: 'Hanyang University OIA visa guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Hanyang University Office of International Affairs',
      note: 'Official source checked for current registration requirements; the page contains fee text that conflicts with the Ministry of Justice notice, so do not treat it as the final fee authority.',
    },
    nameEn: 'Hanyang University',
    nameKo: '한양대학교',
    shortName: 'Hanyang',
    address: '222 Wangsimni-ro, Seongdong-gu, Seoul (서울 성동구 왕십리로 222)',
    campusArea: 'Wangsimni (왕십리)',
    nearestStation: 'Hanyang Univ. Station (한양대역) Line 2',
    dorm: {
      prohibited: ['Personal cooking devices', 'Pets', 'Loud music after 10pm'],
      checkin: 'International House, ground floor. Bring 2 passport-size photos.',
      curfew: 'No curfew but RA inspection at 11pm.',
      laundry: 'Coin laundry in basement, ₩1,000 wash + ₩500 dry.',
    },
    offCampusArea: ['Wangsimni (왕십리)', 'Seongsu (성수)', 'Ttukseom (뚝섬)'],
    nearbyEats: ['Wangsimni Gopchang Alley', 'Seongsu Federation', 'Onion Café'],
    transitRoutes: [
      'Subway — Hanyang Univ. Station (한양대역) Line 2, Exit 2 connects directly into campus underground.',
      'Subway — Wangsimni Station (왕십리역, Lines 2·5·Gyeongui–Jungang·Suin–Bundang) is about 10 min walk.',
      'Bus — Buses along Wangsimni-ro stop at the Hanyang Univ. entrance.',
    ],
  },
  {
    id: 'ewha',
    verification: {
      status: 'latest_unverified',
      sourceUrl: '',
      sourceLabel: 'Not confirmed (미확인)',
      checkedAt: null,
      finalAuthority: 'Ewha Womans University international office',
      note: 'No current official source was verified in this audit. Keep this record as reference information only.',
    },
    nameEn: 'Ewha Womans University',
    nameKo: '이화여자대학교',
    shortName: 'Ewha',
    address: '52 Ewhayeodae-gil, Seodaemun-gu, Seoul (서울 서대문구 이화여대길 52)',
    campusArea: 'Sinchon (신촌)',
    nearestStation: 'Ewha Womans Univ. Station (이대역) Line 2',
    dorm: {
      prohibited: ['Male visitors after 10pm', 'Cooking devices', 'Pets', 'Open flames'],
      checkin: 'I-House front desk. Female-only dormitory.',
      curfew: '11pm weekdays, 1am weekends. Card check on entry.',
      laundry: 'Card-operated laundry, ₩1,200 per wash.',
    },
    offCampusArea: ['Ewha (이대)', 'Sinchon (신촌)', 'Ahyeon (아현)'],
    nearbyEats: ['Ewha Ramyun Alley', 'Cafe Mamas', 'Seoga and Cook'],
    transitRoutes: [
      'Subway — Ewha Womans Univ. Station (이대역) Line 2, Exit 2, then 5 min walk to the main gate.',
      'Bus — 153, 7611 and 7017 stop near the main gate.',
      'Walk — about 5 min straight up the shopping street from Exit 2.',
    ],
  },
  {
    id: 'sogang',
    verification: {
      status: 'latest_unverified',
      sourceUrl: '',
      sourceLabel: 'Not confirmed (미확인)',
      checkedAt: null,
      finalAuthority: 'Sogang University international office',
      note: 'No current official source was verified in this audit. Keep this record as reference information only.',
    },
    nameEn: 'Sogang University',
    nameKo: '서강대학교',
    shortName: 'Sogang',
    address: '35 Baekbeom-ro, Mapo-gu, Seoul (서울 마포구 백범로 35)',
    campusArea: 'Sinchon-Sogang (신촌)',
    nearestStation: 'Sinchon Station (신촌역) Line 2',
    dorm: {
      prohibited: ['Cooking devices', 'Pets', 'Alcohol', 'Smoking indoors'],
      checkin: 'Gonzaga Hall reception. International students: bring sponsor letter.',
      curfew: 'No curfew. Building entrance card required 24/7.',
      laundry: 'Common laundry on each floor, free with student ID.',
    },
    offCampusArea: ['Sinchon (신촌)', 'Daeheung (대흥)', 'Mapo (마포)'],
    nearbyEats: ['Sinchon Galmegisal', 'Mister Pizza Sogang', 'Cafe Onion Mapo'],
    transitRoutes: [
      'Subway — Sogang Univ. Station (서강대역, Gyeongui–Jungang Line) is closest, about 7 min walk.',
      'Subway — Sinchon Station (신촌역) Line 2, Exit 6, then 12 min walk.',
      'Subway — Daeheung Station (대흥역) Line 6 is about 8 min from the south side.',
      'Bus — Shuttle and local buses from Sinchon run every ~15 min.',
    ],
  },
  {
    id: 'hufs',
    verification: {
      status: 'latest_unverified',
      sourceUrl: '',
      sourceLabel: 'Not confirmed (미확인)',
      checkedAt: null,
      finalAuthority: 'Hankuk University of Foreign Studies international office',
      note: 'No current official source was verified in this audit. Keep this record as reference information only.',
    },
    nameEn: 'Hankuk Univ. of Foreign Studies',
    nameKo: '한국외국어대학교',
    shortName: 'HUFS',
    address: '107 Imun-ro, Dongdaemun-gu, Seoul (서울 동대문구 이문로 107)',
    campusArea: 'Imun-dong (이문동)',
    nearestStation: 'Hankuk Univ. of FS Station (외대앞역) Line 1',
    dorm: {
      prohibited: ['Cooking devices', 'Pets', 'Late-night noise'],
      checkin: 'Globee Dormitory main lobby. Open 24/7 for international students.',
      curfew: 'No curfew. Card scan required after 1am.',
      laundry: 'Paid laundry rooms (card), ₩1,000 wash.',
    },
    offCampusArea: ['Imun (이문)', 'Hoegi (회기)', 'Cheongnyangni (청량리)'],
    nearbyEats: ['Imun Seolnongtang', 'Hoegi Galbi Alley', 'Cafe Wholestreet'],
    transitRoutes: [
      'Subway — Hankuk Univ. of FS Station (외대앞역) Line 1, Exit 2, then 5 min walk.',
      'Subway — Hoegi Station (회기역, Line 1·Gyeongui–Jungang) is about 10 min from the south gate.',
      'Bus — 273 and local buses run from the Hoegi area to the main gate.',
    ],
  },
];

export const VERIFIED_UNIVERSITY_IDS = [
  'cau',
  'snu',
  'yonsei',
  'korea',
  'hanyang',
] as const;

export const LATEST_UNVERIFIED_UNIVERSITY_IDS = ['skku', 'ewha', 'sogang', 'hufs'] as const;

export const VERIFIED_UNIVERSITIES = UNIVERSITIES.filter(
  (university) => university.verification.status === 'verified',
);

export const LATEST_UNVERIFIED_UNIVERSITIES = UNIVERSITIES.filter(
  (university) => university.verification.status === 'latest_unverified',
);

export const universityById = (id: string) => UNIVERSITIES.find((u) => u.id === id);
