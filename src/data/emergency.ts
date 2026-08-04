/**
 * Emergency reference content. Cached offline (MMKV) on first load.
 * Sections match PRD §9.
 */

export interface EmergencySection {
  id: string;
  titleEn: string;
  titleKo: string;
  icon: string;
  items: { label: string; detail: string; href?: string }[];
}

export const EMERGENCY_SECTIONS: EmergencySection[] = [
  {
    id: 'phones',
    titleEn: 'Emergency phone numbers',
    titleKo: '긴급 전화번호',
    icon: 'Phone',
    items: [
      { label: '112 — Police (경찰)', detail: 'English speakers available. For crime, theft, harassment.', href: 'tel:112' },
      { label: '119 — Fire & ambulance (소방·구급)', detail: 'English speakers available. For fire, medical emergency.', href: 'tel:119' },
      { label: '1345 — Immigration hotline (출입국)', detail: 'Multilingual. Visa, registration, overstay help.', href: 'tel:1345' },
      { label: '1330 — Korea Tourism Hotline', detail: '24/7 multilingual. General help, translation, transit.', href: 'tel:1330' },
      { label: '120 — Seoul city services', detail: 'Civic info, lost-and-found, garbage rules.', href: 'tel:120' },
    ],
  },
  {
    id: 'medical',
    titleEn: 'English-friendly hospitals',
    titleKo: '영어 진료 병원',
    icon: 'Stethoscope',
    items: [
      {
        label: 'Severance Hospital — International Health Care Center',
        detail: 'Sinchon, Yonsei University. Confirm the current international-clinic location and appointment policy. Tel: 02-2228-5800.',
      },
      {
        label: 'Asan Medical Center — International Clinic',
        detail: 'Songpa-gu. Major hospital, English support. Tel: 02-3010-5001.',
      },
      {
        label: 'Samsung Medical Center — Foreign Office',
        detail: 'Gangnam. Premium service, partial English. Tel: 02-3410-0200.',
      },
      {
        label: '24-hour pharmacies',
        detail: 'Open Pharmacy in Gangnam Station Exit 12, and chain "On-call Pharmacies" near major hospitals.',
      },
    ],
  },
  {
    id: 'lost',
    titleEn: 'Lost or stolen items',
    titleKo: '분실·도난',
    icon: 'Search',
    items: [
      {
        label: 'Lost wallet or phone — first 24 hours',
        detail: 'Report at Seoul Police lost property: lost112.go.kr (English available).',
      },
      {
        label: 'Lost passport',
        detail:
          'Contact your embassy immediately for current emergency-document steps, then confirm immigration reporting requirements.',
      },
      {
        label: 'Subway lost & found',
        detail:
          'Seoul Subway lost-and-found: Lines 1–4 office at City Hall Station, Lines 5–8 at Wangsimni Station.',
      },
      {
        label: 'Taxi-related loss',
        detail: 'Call 1330 with the time and route — they can contact the dispatch system.',
      },
    ],
  },
  {
    id: 'phrases',
    titleEn: 'Emergency Korean phrases',
    titleKo: '긴급 한국어',
    icon: 'MessageCircle',
    items: [
      {
        label: '도와주세요 (do-wa-ju-se-yo)',
        detail: 'Help me!',
      },
      {
        label: '응급실이 어디예요? (eung-geup-sil-i eo-di-ye-yo)',
        detail: 'Where is the emergency room?',
      },
      {
        label: '아파요 (a-pa-yo)',
        detail: 'I\'m hurting / I\'m in pain.',
      },
      {
        label: '경찰을 불러주세요 (gyeong-chal-eul bul-leo-ju-se-yo)',
        detail: 'Please call the police.',
      },
      {
        label: '저는 외국인이에요 (jeo-neun oe-guk-in-i-e-yo)',
        detail: 'I\'m a foreigner. (Use this to flag that you may need a translator.)',
      },
    ],
  },
  {
    id: 'embassies',
    titleEn: 'Embassy contacts',
    titleKo: '대사관 연락처',
    icon: 'Flag',
    items: [
      { label: 'United States Embassy', detail: 'Jongno-gu. Tel: 02-397-4114. After-hours: 02-397-4000.' },
      { label: 'United Kingdom Embassy', detail: 'Jung-gu. Tel: 02-3210-5500.' },
      { label: 'Canada Embassy', detail: 'Jongno-gu. Tel: 02-3783-6000.' },
      { label: 'Australia Embassy', detail: 'Jongno-gu. Tel: 02-2003-0100.' },
      { label: 'Germany Embassy', detail: 'Jung-gu. Tel: 02-748-4114.' },
      { label: 'France Embassy', detail: 'Seodaemun-gu. Tel: 02-3149-4300.' },
      {
        label: 'Other countries',
        detail: 'Search "[your country] embassy Seoul" — most embassies cluster in Jongno or Yongsan.',
      },
    ],
  },
];
