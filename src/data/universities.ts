/**
 * Seoul universities supported in the K-Journey MVP.
 * Each record carries the campus-specific guidance that varies between schools:
 * dormitory rules, neighborhood food spots, and how to actually get to class.
 */

export type HousingType = 'dormitory' | 'off-campus';

export interface UniversityHousingRule {
  prohibited: string[];
  checkin: string;
  curfew?: string;
  laundry?: string;
}

export interface University {
  id: string;
  nameEn: string;
  nameKo: string;
  shortName: string;
  campusArea: string;
  nearestStation: string;
  dorm: UniversityHousingRule;
  offCampusArea: string[];
  nearbyEats: string[];
  transitTip: string;
}

export const UNIVERSITIES: University[] = [
  {
    id: 'yonsei',
    nameEn: 'Yonsei University',
    nameKo: '연세대학교',
    shortName: 'Yonsei',
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
    transitTip: 'Sinchon Station Exit 3 → 5 min walk. Bus 7611 stops at the main gate.',
  },
  {
    id: 'korea',
    nameEn: 'Korea University',
    nameKo: '고려대학교',
    shortName: 'Korea',
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
    transitTip: 'Korea Univ. Station Exit 1. Free shuttle from station to main gate runs 8am–7pm.',
  },
  {
    id: 'snu',
    nameEn: 'Seoul National University',
    nameKo: '서울대학교',
    shortName: 'SNU',
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
    transitTip: 'Subway is far from campus. Take Bus 5511 or 5513 from station Exit 3 — 20 min.',
  },
  {
    id: 'skku',
    nameEn: 'Sungkyunkwan University',
    nameKo: '성균관대학교',
    shortName: 'SKKU',
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
    transitTip: 'Hyehwa Station Exit 4 → 10 min uphill walk. Bus 02 runs every 5 min.',
  },
  {
    id: 'hanyang',
    nameEn: 'Hanyang University',
    nameKo: '한양대학교',
    shortName: 'Hanyang',
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
    transitTip: 'Hanyang Univ. Station Exit 2 → direct campus connection underground.',
  },
  {
    id: 'ewha',
    nameEn: 'Ewha Womans University',
    nameKo: '이화여자대학교',
    shortName: 'Ewha',
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
    transitTip: 'Ewha Station Exit 2 → 5 min walk to main gate. Buses 153, 7611, 7017.',
  },
  {
    id: 'sogang',
    nameEn: 'Sogang University',
    nameKo: '서강대학교',
    shortName: 'Sogang',
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
    transitTip: 'Sinchon Station Exit 6 → 12 min walk. Shuttle bus from Sinchon every 15 min.',
  },
  {
    id: 'cau',
    nameEn: 'Chung-Ang University',
    nameKo: '중앙대학교',
    shortName: 'Chung-Ang',
    campusArea: 'Heukseok (흑석)',
    nearestStation: 'Heukseok Station (흑석역) Line 9',
    dorm: {
      prohibited: ['Personal cooking', 'Pets', 'Alcohol in rooms', 'Smoking'],
      checkin: 'Future House International Hall, ground floor.',
      curfew: 'No curfew. Building card-locked 24h.',
      laundry: 'Free laundry rooms, but shared schedule signup.',
    },
    offCampusArea: ['Heukseok (흑석)', 'Sangdo (상도)', 'Noryangjin (노량진)'],
    nearbyEats: ['Heukseok Toast', 'Sangdo Sutbul Galbi', 'Cafe Tap Public'],
    transitTip: 'Heukseok Station Exit 1 → 8 min walk uphill, or shuttle every 10 min.',
  },
  {
    id: 'hufs',
    nameEn: 'Hankuk Univ. of Foreign Studies',
    nameKo: '한국외국어대학교',
    shortName: 'HUFS',
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
    transitTip: 'HUFS Station Exit 2 → 5 min walk. Bus 273 runs from Hoegi area.',
  },
];

export const universityById = (id: string) => UNIVERSITIES.find((u) => u.id === id);
