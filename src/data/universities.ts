import type { ContentEvidence } from '../lib/contentEvidence';

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

/** Evidence is attached per campus block; the visa source above does not
 * silently vouch for housing, transport, or neighborhood guidance. */
export interface UniversityBlockEvidence extends ContentEvidence {
  note: string;
}

export interface UniversityContentEvidence {
  address: UniversityBlockEvidence;
  dorm: UniversityBlockEvidence;
  transit: UniversityBlockEvidence;
  nearbyEats: UniversityBlockEvidence;
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
  contentEvidence: UniversityContentEvidence;
}

const blockEvidence = (input: Omit<UniversityBlockEvidence, 'checkedAt'>): UniversityBlockEvidence => ({
  ...input,
  checkedAt: '2026-08-29',
});

const areaOnlyNote =
  'Area labels only; no individual businesses are endorsed. Check the current map and local listings before visiting.';

export const UNIVERSITIES: University[] = [
  {
    id: 'cau',
    verification: {
      status: 'verified',
      sourceUrl: 'https://oia.cau.ac.kr/cauoia/exchange/visa.do',
      sourceLabel: 'Chung-Ang University OIA visa and immigration guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Chung-Ang University Office of International Affairs',
      note: 'Official source checked for current exchange-student immigration guidance; campus lifestyle details are tracked separately below.',
    },
    nameEn: 'Chung-Ang University',
    nameKo: '중앙대학교',
    shortName: 'Chung-Ang',
    address: '84 Heukseok-ro, Dongjak-gu, Seoul 06974 (서울 동작구 흑석로 84)',
    campusArea: 'Heukseok (흑석)',
    nearestStation: 'Heukseok Station (흑석역) Line 9',
    dorm: {
      prohibited: ['Check the current residence rules for prohibited appliances, pets, alcohol, and smoking.'],
      checkin:
        'Blue Mir Hall (블루미르홀) buildings 308 and 309 are listed as on-campus housing. Check the current residence notice for the desk, time, and documents.',
      curfew: 'Curfew and access hours vary by residence; confirm the current Blue Mir Hall rules.',
      laundry: 'Laundry facilities and current wash/dryer prices are set by the residence; confirm them at the machine or office.',
    },
    offCampusArea: ['Heukseok (흑석)', 'Sangdo (상도)', 'Noryangjin (노량진)'],
    nearbyEats: [
      'Heukseok student dining district (흑석 대학가 상권)',
      'Sangdo neighborhood dining district (상도 상권)',
      'Noryangjin food streets (노량진 먹거리 일대)',
    ],
    transitRoutes: [
      'Subway — Line 9 Heukseok Station (흑석역), Exit 3 or 4, then follow the campus signs.',
      'Bus and campus shuttle services change by term; check the current CAU campus guide or a live route planner.',
    ],
    contentEvidence: {
      address: blockEvidence({
        sourceUrl: 'https://oia.cau.ac.kr/cauoia/intro/contact.do',
        sourceTitle: 'CAU Office of International Affairs contact and address',
        publisher: 'Chung-Ang University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Chung-Ang University Office of International Affairs',
        note: 'The official contact page lists the Seoul campus address.',
      }),
      dorm: blockEvidence({
        sourceUrl: 'https://oia.cau.ac.kr/_attach/gradcau/file/2026/05/bMmpXWnhSuoiEphiZOxRNXRplb.pdf',
        sourceTitle: 'CAU 2026 graduate admission guide, campus housing',
        publisher: 'Chung-Ang University',
        contentClass: 'B',
        verification: 'needs_review',
        finalAuthority: 'Chung-Ang University Seoul Campus Dormitory (02-820-6672)',
        note: 'The official guide confirms Blue Mir Hall buildings 308 and 309, but does not confirm the rules, access hours, or current laundry price used here.',
      }),
      transit: blockEvidence({
        sourceUrl: 'https://admission.cau.ac.kr/file/pdfDown.pdf?ofn=2025%ED%95%99%EB%85%84%EB%8F%84+%EC%A4%91%EC%95%99%EB%8C%80%ED%95%99%EA%B5%90+%EC%9E%AC%EC%99%B8%EA%B5%AD%EB%AF%BC+%ED%8A%B9%EB%B3%84%EC%A0%84%ED%98%95%289%EC%9B%94%29+%EB%AA%A8%EC%A7%91%EC%9A%94%EA%B0%95.pdf&sfn=20250318051748147_18fda2e3cbe74698b9743ae3511eaa8a.pdf',
        sourceTitle: 'CAU admissions guide, Seoul campus directions',
        publisher: 'Chung-Ang University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Chung-Ang University campus information desk',
        note: 'The official guide lists Line 9 Heukseok Station exits 3 and 4. Shuttle frequency and other route details are intentionally not stated.',
      }),
      nearbyEats: blockEvidence({
        sourceUrl: 'https://oia.cau.ac.kr/cauoia/intro/contact.do',
        sourceTitle: 'CAU campus address and neighborhood context',
        publisher: 'Chung-Ang University',
        contentClass: 'C',
        verification: 'needs_review',
        finalAuthority: 'Chung-Ang University Office of International Affairs',
        note: areaOnlyNote,
      }),
    },
  },
  {
    id: 'yonsei',
    verification: {
      status: 'verified',
      sourceUrl: 'https://gosc.yonsei.ac.kr/gosc/visa/maintaining.do',
      sourceLabel: 'Yonsei University Global One-Stop Service Center guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Yonsei University Office of International Affairs',
      note: 'Official source checked for current residence-card and group-application guidance; campus blocks are tracked separately below.',
    },
    nameEn: 'Yonsei University',
    nameKo: '연세대학교',
    shortName: 'Yonsei',
    address: '50 Yonsei-ro, Seodaemun-gu, Seoul (서울 서대문구 연세로 50)',
    campusArea: 'Sinchon (신촌)',
    nearestStation: 'Sinchon Station (신촌역) Line 2',
    dorm: {
      prohibited: ['Hot plates, irons, toasters, rice cookers, and similar appliances', 'Check the current residence rules for other prohibited items'],
      checkin: 'SK Global House has a 24-hour front desk. Check the current move-in notice for the desk procedure and required documents.',
      curfew: 'The official housing guide says the main gate is open 24 hours with no curfew; the Director may adjust access.',
      laundry: 'Coin laundry and a coin dryer are available; the official page does not state a current price.',
    },
    offCampusArea: ['Sinchon (신촌)', 'Hongdae (홍대)', 'Yeonnam-dong (연남동)'],
    nearbyEats: [
      'Sinchon university district (신촌 대학가)',
      'Hongdae–Yeonnam dining area (홍대·연남 상권)',
      'Yeonnam-dong neighborhood dining district (연남동 상권)',
    ],
    transitRoutes: [
      'Subway — Line 2 Sinchon Station (신촌역), Exit 2 or 3, then follow Yonsei’s campus signs.',
      'Bus — the official directions list buses including 163, 171, 172, 272, 601, 606, 672, 7017 and 7737 near campus.',
      'Airport bus — route 6011 is listed for the Yonsei University stop; check the operator for current service.',
    ],
    contentEvidence: {
      address: blockEvidence({
        sourceUrl: 'https://temp.yonsei.ac.kr/en_sc/intro/directions1.jsp',
        sourceTitle: 'Yonsei University maps and directions, Sinchon campus',
        publisher: 'Yonsei University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Yonsei University campus information desk',
        note: 'The official directions page lists the 50 Yonsei-ro address.',
      }),
      dorm: blockEvidence({
        sourceUrl: 'https://mirae.yonsei.ac.kr/en_sc/2264/subview.do',
        sourceTitle: 'Yonsei University SK Global House housing guide',
        publisher: 'Yonsei University',
        contentClass: 'B',
        verification: 'needs_review',
        finalAuthority: 'Yonsei Housing Office (02-2123-7481)',
        note: 'The official guide confirms the 24-hour front desk, no-curfew main gate, coin laundry, and prohibited cooking appliances. Prices are not published there.',
      }),
      transit: blockEvidence({
        sourceUrl: 'https://temp.yonsei.ac.kr/en_sc/intro/directions1.jsp',
        sourceTitle: 'Yonsei University maps and directions, Sinchon campus',
        publisher: 'Yonsei University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Yonsei University campus information desk',
        note: 'The official page lists Line 2 exits, campus bus routes, and airport bus 6011. Travel times and live departures are intentionally omitted.',
      }),
      nearbyEats: blockEvidence({
        sourceUrl: 'https://temp.yonsei.ac.kr/en_sc/intro/directions1.jsp',
        sourceTitle: 'Yonsei campus neighborhood context',
        publisher: 'Yonsei University',
        contentClass: 'C',
        verification: 'needs_review',
        finalAuthority: 'Yonsei University Office of International Affairs',
        note: areaOnlyNote,
      }),
    },
  },
  {
    id: 'korea',
    verification: {
      status: 'verified',
      sourceUrl: 'https://gsc.korea.ac.kr/gsc/ExchangeVisitingProgram/Visa_Immigration/Visa/Visa.do',
      sourceLabel: 'Korea University Global Service Center visa guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Korea University Global Service Center',
      note: 'Official source checked for exchange and visiting-student residence-card guidance; campus blocks are tracked separately below.',
    },
    nameEn: 'Korea University',
    nameKo: '고려대학교',
    shortName: 'Korea',
    address: '145 Anam-ro, Seongbuk-gu, Seoul 02841 (서울 성북구 안암로 145)',
    campusArea: 'Anam-dong (안암동)',
    nearestStation: 'Korea Univ. Station (고려대역) Line 6',
    dorm: {
      prohibited: ['Cooking devices and heating equipment in rooms', 'Pets and smoking in the residence building'],
      checkin: 'CJ International House and Anam International House are listed for international residents. Check the current move-in notice for the desk and documents.',
      curfew: 'Access hours differ by residence building; confirm the current Anam Dormitory rules.',
      laundry: 'Laundry rooms are available in the buildings; the current wash/dryer price may change and should be confirmed on site.',
    },
    offCampusArea: ['Anam (안암)', 'Jegi-dong (제기동)', 'Bomun-dong (보문동)'],
    nearbyEats: [
      'Anam university district (안암 대학가)',
      'Jegi-dong–Gyeongdong Market area (제기동·경동시장 일대)',
      'Bomun neighborhood dining district (보문 상권)',
    ],
    transitRoutes: [
      'Subway — Line 6 Korea University Station (고려대역), Exit 1, serves the Humanities and Social Sciences area.',
      'Subway — Line 6 Anam Station (안암역), Exit 4, serves the Science and Medical area.',
      'Bus — check the current university directions for linked bus routes; service and stops can change.',
    ],
    contentEvidence: {
      address: blockEvidence({
        sourceUrl: 'https://www.korea.ac.kr/en/995/subview.do',
        sourceTitle: 'Korea University how to reach us',
        publisher: 'Korea University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Korea University One-Stop Service Center (02-3290-1114)',
        note: 'The official page lists the 145 Anam-ro address.',
      }),
      dorm: blockEvidence({
        sourceUrl: 'https://dorm.korea.ac.kr/front/board/6/post?search_category_cd=A03',
        sourceTitle: 'Korea University Anam Dormitory FAQ',
        publisher: 'Korea University Anam Dormitory',
        contentClass: 'B',
        verification: 'needs_review',
        finalAuthority: 'Korea University Anam Dormitory (02-3290-1554)',
        note: 'The official FAQ confirms international houses and laundry rooms, but laundry pricing is explicitly changeable and access/check-in rules depend on the assigned building.',
      }),
      transit: blockEvidence({
        sourceUrl: 'https://www.korea.ac.kr/en/995/subview.do',
        sourceTitle: 'Korea University how to reach us',
        publisher: 'Korea University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Korea University campus information desk',
        note: 'The official directions list Line 6 exits 1 and 4 plus linked bus routes. The old shuttle timetable was removed because it was not confirmed.',
      }),
      nearbyEats: blockEvidence({
        sourceUrl: 'https://www.korea.ac.kr/en/995/subview.do',
        sourceTitle: 'Korea University campus neighborhood context',
        publisher: 'Korea University',
        contentClass: 'C',
        verification: 'needs_review',
        finalAuthority: 'Korea University Office of International Affairs',
        note: areaOnlyNote,
      }),
    },
  },
  {
    id: 'snu',
    verification: {
      status: 'verified',
      sourceUrl: 'https://oga.snu.ac.kr/residence-card',
      sourceLabel: 'Seoul National University OGA Residence Card guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Seoul National University Office of Global Affairs',
      note: 'Official source checked for exchange and visiting-student residence-card guidance; campus blocks are tracked separately below.',
    },
    nameEn: 'Seoul National University',
    nameKo: '서울대학교',
    shortName: 'SNU',
    address: '1 Gwanak-ro, Gwanak-gu, Seoul 08826 (서울 관악구 관악로 1)',
    campusArea: 'Gwanak-gu (관악구)',
    nearestStation: 'Seoul Nat\'l Univ. Station (서울대입구역) Line 2',
    dorm: {
      prohibited: ['Check the current Gwanak Residence Halls rules for appliances, pets, smoking, and alcohol.'],
      checkin: 'Gwanak Residence Halls manages move-in by building and term; check the current move-in guide for the office, time, and documents.',
      curfew: 'Access hours vary by building; confirm the current Gwanak Residence Halls living guide.',
      laundry: 'Laundry rooms are provided in the residence halls; current payment method and price are not stated here.',
    },
    offCampusArea: ['Sillim-dong (신림동)', 'Bongcheon-dong (봉천동)', 'Seoul Nat\'l University Entrance'],
    nearbyEats: [
      'Sillim-dong student dining district (신림동 대학가)',
      'Bongcheon neighborhood dining district (봉천동 상권)',
      'SNU Entrance university district (서울대입구 대학가)',
    ],
    transitRoutes: [
      'Subway — Line 2 Seoul National University Station (서울대입구역), Exit 3, then take the campus shuttle or bus 5511/5513.',
      'Bus — the official campus guide lists 5511, 5513 and 5516 for stops inside the large campus.',
      'Live departures and walking times vary by campus destination; check the current campus guide or a route planner.',
    ],
    contentEvidence: {
      address: blockEvidence({
        sourceUrl: 'https://eng.snu.ac.kr/about/campus-guide/how-to-find-us',
        sourceTitle: 'SNU College of Engineering how to find us',
        publisher: 'Seoul National University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Seoul National University campus information desk',
        note: 'The official page lists the Gwanak campus address.',
      }),
      dorm: blockEvidence({
        sourceUrl: 'https://snudorm.snu.ac.kr/en/',
        sourceTitle: 'SNU Gwanak Residence Halls',
        publisher: 'Seoul National University Gwanak Residence Halls',
        contentClass: 'B',
        verification: 'needs_review',
        finalAuthority: 'SNU Gwanak Residence Halls (02-880-5401~5404)',
        note: 'The official residence site is the authority, but rules, move-in details, and laundry prices vary by building and were not asserted here.',
      }),
      transit: blockEvidence({
        sourceUrl: 'https://eng.snu.ac.kr/about/campus-guide/how-to-find-us',
        sourceTitle: 'SNU College of Engineering how to find us',
        publisher: 'Seoul National University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Seoul National University campus information desk',
        note: 'The official page confirms Line 2 Exit 3, campus shuttle, and buses 5511/5513/5516. Times are omitted because they differ by term and destination.',
      }),
      nearbyEats: blockEvidence({
        sourceUrl: 'https://eng.snu.ac.kr/about/campus-guide/how-to-find-us',
        sourceTitle: 'SNU campus neighborhood context',
        publisher: 'Seoul National University',
        contentClass: 'C',
        verification: 'needs_review',
        finalAuthority: 'Seoul National University Office of Global Affairs',
        note: areaOnlyNote,
      }),
    },
  },
  {
    id: 'skku',
    verification: {
      status: 'verified',
      sourceUrl:
        'https://www.skku.edu/eng/International/AboutDivision/AbouttheInternationalAffairsDivision03.do',
      sourceLabel: 'Sungkyunkwan University Office of International Student Services',
      checkedAt: '2026-08-06',
      finalAuthority: 'SKKU Office of International Student Services (02-760-0020)',
      note: 'Official source checked for the office that handles visa and immigration matters; campus blocks are tracked separately below.',
    },
    nameEn: 'Sungkyunkwan University',
    nameKo: '성균관대학교',
    shortName: 'SKKU',
    address: '25-2 Sungkyunkwan-ro, Jongno-gu, Seoul (서울 종로구 성균관로 25-2)',
    campusArea: 'Hyehwa (혜화)',
    nearestStation: 'Hyehwa Station (혜화역) Line 4',
    dorm: {
      prohibited: ['Check the current residence rules for cooking appliances, pets, visitors, and alcohol.'],
      checkin: 'Check the current Seoul dormitory notice for the assigned building, front desk, check-in time, and required documents.',
      curfew: 'Access hours and visitor rules vary by residence; confirm the current Seoul dormitory rules.',
      laundry: 'Paid washers and dryers may be available by building; confirm the current payment method and price.',
    },
    offCampusArea: ['Hyehwa (혜화)', 'Daehakno (대학로)', 'Myeongnyun-dong (명륜동)'],
    nearbyEats: [
      'Hyehwa university district (혜화 대학가)',
      'Daehak-ro theater and dining district (대학로 상권)',
      'Myeongnyun neighborhood dining district (명륜동 상권)',
    ],
    transitRoutes: [
      'Subway — Line 4 Hyehwa Station (혜화역), Exit 1; walk about 200 m to the campus shuttle stop.',
      'Subway — Line 3 Anguk Station Exit 2 or Jonggak Station Exit 2/3; Jongno-2 village bus enters campus.',
      'Shuttle — the official route lists Hyehwa Exit 1 → campus access road → SKKU main gate → 600th Anniversary Hall.',
    ],
    contentEvidence: {
      address: blockEvidence({
        sourceUrl: 'https://dorm.skku.edu/dorm_seoul_eng/intro/loacation_transportation.jsp',
        sourceTitle: 'SKKU Seoul dormitory location and transportation',
        publisher: 'Sungkyunkwan University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'SKKU Seoul Dormitory Office',
        note: 'The official page lists the Seoul campus address at 25-2 Sungkyunkwan-ro.',
      }),
      dorm: blockEvidence({
        sourceUrl: 'https://dorm.skku.edu/dorm_seoul_eng/intro/loacation_transportation.jsp',
        sourceTitle: 'SKKU Seoul dormitory location and transportation',
        publisher: 'Sungkyunkwan University',
        contentClass: 'B',
        verification: 'needs_review',
        finalAuthority: 'SKKU Seoul Dormitory Office',
        note: 'The official page confirms the Seoul dormitory office and location, but not the room rules, check-in details, or laundry prices used in this card.',
      }),
      transit: blockEvidence({
        sourceUrl: 'https://dorm.skku.edu/dorm_seoul_eng/intro/loacation_transportation.jsp',
        sourceTitle: 'SKKU Seoul dormitory location and transportation',
        publisher: 'Sungkyunkwan University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'SKKU Seoul Dormitory Office',
        note: 'The official directions confirm Line 4 Hyehwa Exit 1, Line 3 alternatives, and the campus shuttle route. Service times are omitted.',
      }),
      nearbyEats: blockEvidence({
        sourceUrl: 'https://dorm.skku.edu/dorm_seoul_eng/intro/loacation_transportation.jsp',
        sourceTitle: 'SKKU campus neighborhood context',
        publisher: 'Sungkyunkwan University',
        contentClass: 'C',
        verification: 'needs_review',
        finalAuthority: 'SKKU Office of International Student Services',
        note: areaOnlyNote,
      }),
    },
  },
  {
    id: 'hanyang',
    verification: {
      status: 'verified',
      sourceUrl: 'https://oia.hanyang.ac.kr/visa',
      sourceLabel: 'Hanyang University OIA visa guidance',
      checkedAt: '2026-07-27',
      finalAuthority: 'Hanyang University Office of International Affairs',
      note: 'Official source checked for current registration requirements; the campus blocks below use separate official campus and residence sources.',
    },
    nameEn: 'Hanyang University',
    nameKo: '한양대학교',
    shortName: 'Hanyang',
    address: '222 Wangsimni-ro, Seongdong-gu, Seoul 04763 (서울 성동구 왕십리로 222)',
    campusArea: 'Wangsimni (왕십리)',
    nearestStation: 'Hanyang Univ. Station (한양대역) Line 2',
    dorm: {
      prohibited: ['Check the current student residence rules for cooking devices, pets, and noise.'],
      checkin: 'Hanyang Residence Hall publishes the current check-in procedure and documents by building and term; follow that notice.',
      curfew: 'Access hours and inspections vary by residence; confirm the current Hanyang Residence Hall rules.',
      laundry: 'The official residence information lists laundry facilities; confirm the current payment method and price.',
    },
    offCampusArea: ['Wangsimni (왕십리)', 'Seongsu (성수)', 'Ttukseom (뚝섬)'],
    nearbyEats: [
      'Wangsimni station dining district (왕십리역 상권)',
      'Seongsu industrial dining district (성수 상권)',
      'Ttukseom neighborhood dining district (뚝섬 상권)',
    ],
    transitRoutes: [
      'Subway — Line 2 Hanyang University Station (한양대역), Exit 2, is the campus station.',
      'Subway — Wangsimni Station (왕십리역) provides Line 2 and other connections; use the current campus map for the best gate.',
      'Bus — the official campus map lists routes including 121, 302, N62, 2012, 2014, 2016 and 2222 near the main gate.',
    ],
    contentEvidence: {
      address: blockEvidence({
        sourceUrl: 'https://www.hanyang.ac.kr/web/eng/map_seoul',
        sourceTitle: 'Hanyang University Seoul campus map and directions',
        publisher: 'Hanyang University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Hanyang University campus information desk (02-2220-0114)',
        note: 'The official page lists the Seoul campus address.',
      }),
      dorm: blockEvidence({
        sourceUrl: 'https://www.hanyang.ac.kr/web/eng/dormitory',
        sourceTitle: 'Hanyang University residence hall guide',
        publisher: 'Hanyang University',
        contentClass: 'B',
        verification: 'needs_review',
        finalAuthority: 'Hanyang University Residence Hall (02-2220-1472)',
        note: 'The official guide confirms foreign-student residence halls and facilities, but rules, check-in details, and laundry prices vary by building and term.',
      }),
      transit: blockEvidence({
        sourceUrl: 'https://www.hanyang.ac.kr/web/eng/map_seoul',
        sourceTitle: 'Hanyang University Seoul campus map and directions',
        publisher: 'Hanyang University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Hanyang University campus information desk',
        note: 'The official page confirms Line 2 Hanyang University Station Exit 2 and nearby bus routes. Current arrivals should be checked live.',
      }),
      nearbyEats: blockEvidence({
        sourceUrl: 'https://www.hanyang.ac.kr/web/eng/map_seoul',
        sourceTitle: 'Hanyang campus neighborhood context',
        publisher: 'Hanyang University',
        contentClass: 'C',
        verification: 'needs_review',
        finalAuthority: 'Hanyang University Office of International Affairs',
        note: areaOnlyNote,
      }),
    },
  },
  {
    id: 'ewha',
    verification: {
      status: 'verified',
      sourceUrl: 'https://isa.ewha.ac.kr/oisa/index.do',
      sourceLabel: 'Ewha Womans University International Student Affairs Team (국제학생팀)',
      checkedAt: '2026-08-29',
      finalAuthority: 'Ewha Womans University International Student Affairs Team',
      note: 'Official International Student Affairs Team site and its visa, residence, and dormitory sections were opened on 2026-08-29.',
    },
    nameEn: 'Ewha Womans University',
    nameKo: '이화여자대학교',
    shortName: 'Ewha',
    address: '52 Ewhayeodae-gil, Seodaemun-gu, Seoul 03760 (서울 서대문구 이화여대길 52)',
    campusArea: 'Sinchon (신촌)',
    nearestStation: 'Ewha Womans Univ. Station (이대역) Line 2',
    dorm: {
      prohibited: ['Check the current E-House/I-House residence rules for visitors, cooking devices, pets, and open flames.'],
      checkin: 'E-House and I-House are listed as residence options. Check the current housing notice for the assigned desk, date, time, and documents.',
      curfew: 'Access hours vary by residence building; confirm the current Ewha housing rules.',
      laundry: 'Laundry rooms are listed among the residence facilities; current payment method and price are not stated here.',
    },
    offCampusArea: ['Ewha (이대)', 'Sinchon (신촌)', 'Ahyeon (아현)'],
    nearbyEats: [
      'Ewha university district (이대 대학가)',
      'Sinchon university district (신촌 대학가)',
      'Ahyeon neighborhood dining district (아현 상권)',
    ],
    transitRoutes: [
      'Subway — Line 2 Ewha Womans University Station (이대역), Exit 2 or 3, then walk about 300 m to the main gate.',
      'Airport bus — Ewha’s official directions list airport routes 6002 and 6011; check the operator for current service.',
      'Bus — use the current Ewha campus bus page for stops and live arrivals; routes change.',
    ],
    contentEvidence: {
      address: blockEvidence({
        sourceUrl: 'https://www.ewha.ac.kr/ewhaen/intro/location.do',
        sourceTitle: 'Ewha Womans University directions',
        publisher: 'Ewha Womans University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Ewha Womans University',
        note: 'The official directions page lists 52 Ewhayeodae-gil and postal code 03760.',
      }),
      dorm: blockEvidence({
        sourceUrl: 'https://isa.ewha.ac.kr/bbs/oisa/186/4558/download.do',
        sourceTitle: 'Ewha international admissions guide, housing information',
        publisher: 'Ewha Womans University International Student Affairs Team',
        contentClass: 'B',
        verification: 'needs_review',
        finalAuthority: 'Ewha Housing Office (E-House 02-3277-5905; I-House 02-3277-6001)',
        note: 'The official 2026 guide confirms E-House/I-House and laundry facilities, but does not confirm the access rules or current laundry price used here.',
      }),
      transit: blockEvidence({
        sourceUrl: 'https://www.ewha.ac.kr/ewhaen/intro/location.do',
        sourceTitle: 'Ewha Womans University directions',
        publisher: 'Ewha Womans University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Ewha Womans University campus information desk (+82-2-3277-2114)',
        note: 'The official page confirms Line 2, airport routes 6002/6011, and campus arrival points. Live bus times are intentionally omitted.',
      }),
      nearbyEats: blockEvidence({
        sourceUrl: 'https://www.ewha.ac.kr/ewhaen/intro/location.do',
        sourceTitle: 'Ewha campus neighborhood context',
        publisher: 'Ewha Womans University',
        contentClass: 'C',
        verification: 'needs_review',
        finalAuthority: 'Ewha Womans University International Student Affairs Team',
        note: areaOnlyNote,
      }),
    },
  },
  {
    id: 'sogang',
    verification: {
      status: 'verified',
      sourceUrl: 'https://oisa.sogang.ac.kr/oisa/index.do',
      sourceLabel: 'Sogang University Office of International Student Affairs (국제학생팀)',
      checkedAt: '2026-08-06',
      finalAuthority: 'Sogang University Office of International Student Affairs (02-705-8118)',
      note: 'Official source checked; the site carries its own student-visa and alien-registration sections. Campus blocks are tracked separately below.',
    },
    nameEn: 'Sogang University',
    nameKo: '서강대학교',
    shortName: 'Sogang',
    address: '35 Baekbeom-ro, Mapo-gu, Seoul 04107 (서울 마포구 백범로 35)',
    campusArea: 'Sinchon-Sogang (신촌)',
    nearestStation: 'Sinchon Station (신촌역) Line 2',
    dorm: {
      prohibited: ['Check the current Gonzaga Hall rules for cooking devices, pets, alcohol, and smoking.'],
      checkin: 'Gonzaga Hall publishes its current check-in procedure by programme and term; follow the residence notice.',
      curfew: 'Access hours and visitor rules vary by Gonzaga Hall notice; confirm the current residence rules.',
      laundry: 'Gonzaga Hall has 24-hour laundry rooms with mobile-payment washers; the current price is not stated here.',
    },
    offCampusArea: ['Sinchon (신촌)', 'Daeheung (대흥)', 'Mapo (마포)'],
    nearbyEats: [
      'Sinchon university district (신촌 대학가)',
      'Daeheung station dining district (대흥역 상권)',
      'Mapo neighborhood dining district (마포 상권)',
    ],
    transitRoutes: [
      'Subway — Gyeongui–Jungang Line Sogang University Station (서강대역), Exit 1, serves the main gate area.',
      'Subway — Line 2 Sinchon Station (신촌역), Exit 6, leads toward the main gate.',
      'Subway — Line 6 Daeheung Station (대흥역), Exit 1, leads toward the south/back gate.',
      'Bus — use the current Sogang campus guide or a live route planner for bus stops and departures.',
    ],
    contentEvidence: {
      address: blockEvidence({
        sourceUrl: 'https://econ.sogang.ac.kr/econ/2721/subview.do',
        sourceTitle: 'Sogang University directions',
        publisher: 'Sogang University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Sogang University campus information desk',
        note: 'The official directions page lists 35 Baekbeom-ro, Mapo-gu, Seoul 04107.',
      }),
      dorm: blockEvidence({
        sourceUrl: 'https://gonzaga.sogang.ac.kr/home/sub01/sub01_03.jsp',
        sourceTitle: 'Sogang University Gonzaga Hall facilities',
        publisher: 'Sogang University Gonzaga Hall',
        contentClass: 'B',
        verification: 'needs_review',
        finalAuthority: 'Gonzaga Hall administration (02-705-8811)',
        note: 'The official facility page confirms 24-hour laundry rooms and mobile-payment washers, but current rules and prices are not asserted.',
      }),
      transit: blockEvidence({
        sourceUrl: 'https://econ.sogang.ac.kr/econ/2721/subview.do',
        sourceTitle: 'Sogang University directions',
        publisher: 'Sogang University',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'Sogang University campus information desk',
        note: 'The official page confirms Sogang University Station Exit 1, Sinchon Exit 6, and Daeheung Exit 1. Travel times are omitted.',
      }),
      nearbyEats: blockEvidence({
        sourceUrl: 'https://econ.sogang.ac.kr/econ/2721/subview.do',
        sourceTitle: 'Sogang campus neighborhood context',
        publisher: 'Sogang University',
        contentClass: 'C',
        verification: 'needs_review',
        finalAuthority: 'Sogang University Office of International Student Affairs',
        note: areaOnlyNote,
      }),
    },
  },
  {
    id: 'hufs',
    verification: {
      status: 'verified',
      sourceUrl: 'https://issc.hufs.ac.kr/',
      sourceLabel: 'HUFS International Student Services Center (외국인유학생종합지원센터)',
      checkedAt: '2026-08-06',
      finalAuthority: 'HUFS International Student Services Center (02-2173-2066)',
      note: 'Official source checked for alien-registration guidance, including the 15-day deadline for reporting a change of address. Campus blocks are tracked separately below.',
    },
    nameEn: 'Hankuk Univ. of Foreign Studies',
    nameKo: '한국외국어대학교',
    shortName: 'HUFS',
    address: '107 Imun-ro, Dongdaemun-gu, Seoul 02450 (서울 동대문구 이문로 107)',
    campusArea: 'Imun-dong (이문동)',
    nearestStation: 'Hankuk Univ. of FS Station (외대앞역) Line 1',
    dorm: {
      prohibited: ['Check the current Globee Dormitory rules for cooking devices, pets, and noise.'],
      checkin: 'Globee Dormitory publishes the current check-in desk, time, and documents by term; follow the residence notice.',
      curfew: 'Access hours vary by residence; confirm the current Globee Dormitory rules.',
      laundry: 'Laundry facilities and the current payment method/price should be confirmed with Globee Dormitory.',
    },
    offCampusArea: ['Imun (이문)', 'Hoegi (회기)', 'Cheongnyangni (청량리)'],
    nearbyEats: [
      'Imun university district (이문 대학가)',
      'Hoegi university district (회기 대학가)',
      'Cheongnyangni market district (청량리 시장 일대)',
    ],
    transitRoutes: [
      'Subway — Line 1 Hankuk University of Foreign Studies Station (외대앞역), Exit 1, then follow the campus signs.',
      'Bus — the official campus directions list 261, 147, 120 and 273 near the Seoul campus.',
      'Live bus arrivals and walking times vary; check the current campus guide or a route planner.',
    ],
    contentEvidence: {
      address: blockEvidence({
        sourceUrl: 'https://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=133295682&siteId=oia3',
        sourceTitle: 'HUFS Office of International Affairs directions',
        publisher: 'Hankuk University of Foreign Studies',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'HUFS Office of International Affairs (02-2173-3297/3386)',
        note: 'The official page lists the Seoul campus address at 107 Imun-ro.',
      }),
      dorm: blockEvidence({
        sourceUrl: 'https://issc.hufs.ac.kr/',
        sourceTitle: 'HUFS International Student Services Center',
        publisher: 'Hankuk University of Foreign Studies',
        contentClass: 'B',
        verification: 'needs_review',
        finalAuthority: 'HUFS International Student Services Center',
        note: 'The official international-student site is the right authority, but a current Globee Dormitory rule, check-in notice, and laundry price were not found; those values are intentionally generalized.',
      }),
      transit: blockEvidence({
        sourceUrl: 'https://hufsdis.hufs.ac.kr/hufsdis/m01_s04.do',
        sourceTitle: 'HUFS Seoul campus map and directions',
        publisher: 'Hankuk University of Foreign Studies',
        contentClass: 'B',
        verification: 'verified',
        finalAuthority: 'HUFS campus information desk',
        note: 'The official directions confirm Line 1 Exit 1 and bus routes 261, 147, 120 and 273.',
      }),
      nearbyEats: blockEvidence({
        sourceUrl: 'https://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=133295682&siteId=oia3',
        sourceTitle: 'HUFS campus neighborhood context',
        publisher: 'Hankuk University of Foreign Studies',
        contentClass: 'C',
        verification: 'needs_review',
        finalAuthority: 'HUFS Office of International Affairs',
        note: areaOnlyNote,
      }),
    },
  },
];

export const VERIFIED_UNIVERSITY_IDS = [
  'cau',
  'snu',
  'yonsei',
  'korea',
  'hanyang',
  'skku',
  'ewha',
  'sogang',
  'hufs',
] as const;

export const LATEST_UNVERIFIED_UNIVERSITY_IDS = [] as const;

export const VERIFIED_UNIVERSITIES = UNIVERSITIES.filter(
  (university) => university.verification.status === 'verified',
);

export const LATEST_UNVERIFIED_UNIVERSITIES = UNIVERSITIES.filter(
  (university) => university.verification.status === 'latest_unverified',
);

export const universityById = (id: string) => UNIVERSITIES.find((u) => u.id === id);
