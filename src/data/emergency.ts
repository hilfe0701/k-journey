/**
 * Emergency reference content. Cached offline (MMKV) on first load.
 * Sections match PRD §9.
 *
 * Every item carries `ContentEvidence`. This is safety content that is cached
 * offline and read when something has already gone wrong, so an unsourced
 * sentence here is the most expensive kind of unsourced sentence in the app
 * (`docs/CONTENT_INVENTORY.md` §9 P0-1).
 *
 * Four claims were wrong and are corrected below rather than re-sourced:
 *
 *  - 1345 was presented without hours. It is weekdays 09:00–22:00 KST, and only
 *    three of its twenty languages run after 18:00.
 *  - The subway lost-and-found was listed as two offices ("Lines 1–4 at City
 *    Hall, Lines 5–8 at Wangsimni"). There are four, split 1·2 / 3·4 / 5·8 /
 *    6·7. Centres are listed by line, not by station: the two operator sources
 *    disagree on where the Lines 3–4 centre now sits, and the line a centre
 *    serves outlives the room it is in.
 *  - The 24-hour pharmacy was a single shop at one subway exit. Replaced with
 *    the Korean Pharmaceutical Association's own finder, which cannot close.
 *  - The US embassy carried a separate after-hours number. The embassy's duty
 *    officer is reached on the main line; the second number is not published.
 *
 * Five embassy numbers are kept but marked `needs_review`: their own sites
 * could not be opened on the check date, and the UK has moved to a contact
 * form, so publishing them as confirmed would be a guess. The Ministry of
 * Foreign Affairs directory now leads the section, which is also the only entry
 * that serves a reader whose country is not one of the six.
 */

import type { ContentEvidence } from '../lib/contentEvidence';

export interface EmergencyItem {
  label: string;
  detail: string;
  /** The action the reader takes: `tel:` to dial, `https:` to open a service. */
  href?: string;
  evidence: ContentEvidence;
}

export interface EmergencySection {
  id: string;
  titleEn: string;
  titleKo: string;
  icon: string;
  items: EmergencyItem[];
}

const CHECKED = '2026-08-04';

const POLICE: ContentEvidence = {
  sourceUrl: 'https://112.go.kr/',
  sourceTitle: '112 신고 (112 emergency reporting)',
  publisher: 'Korean National Police Agency (경찰청)',
  checkedAt: CHECKED,
  contentClass: 'A',
  verification: 'verified',
  finalAuthority: '112',
  jurisdiction: 'Republic of Korea',
};

const FIRE_AGENCY: ContentEvidence = {
  sourceUrl: 'https://www.nfa.go.kr/nfa/safetyinfo/emergencyservice/119emergencydeclaration/',
  sourceTitle: '119 구급신고 요령 (How to report to 119)',
  publisher: 'National Fire Agency (소방청)',
  checkedAt: CHECKED,
  contentClass: 'A',
  verification: 'verified',
  finalAuthority: '119',
  jurisdiction: 'Republic of Korea',
};

const IMMIGRATION_CONTACT_CENTER: ContentEvidence = {
  sourceUrl: 'https://www.moj.go.kr/moj/196/subview.do',
  sourceTitle: '외국인종합안내센터 1345 (Immigration Contact Center)',
  publisher: 'Ministry of Justice (법무부)',
  checkedAt: CHECKED,
  contentClass: 'A',
  verification: 'verified',
  finalAuthority: 'Immigration Contact Center 1345',
  jurisdiction: 'Republic of Korea',
};

const TRAVEL_HOTLINE: ContentEvidence = {
  sourceUrl: 'https://knto.or.kr/pressRelease/429189',
  sourceTitle: '1330 관광통역안내전화 8개 국어 확대 운영',
  publisher: 'Korea Tourism Organization (한국관광공사)',
  checkedAt: CHECKED,
  contentClass: 'A',
  verification: 'verified',
  finalAuthority: 'Korea Travel Hotline 1330',
  jurisdiction: 'Republic of Korea',
};

const SEOUL_DASAN: ContentEvidence = {
  sourceUrl: 'https://www.120dasan.or.kr/dsnc/main/contents.do?menuNo=200020',
  sourceTitle: '외국어 상담 (Foreign-language counselling)',
  publisher: 'Seoul 120 Dasan Call Foundation (서울특별시 120다산콜재단)',
  checkedAt: CHECKED,
  contentClass: 'A',
  verification: 'verified',
  finalAuthority: 'Seoul 120 Dasan Call Center',
  jurisdiction: 'Seoul',
};

const MOFA_EMBASSY_DIRECTORY: ContentEvidence = {
  sourceUrl: 'https://www.mofa.go.kr/eng/pgm/m_5789/uss/cnsrshp/inKoEmblgbdAdres.do',
  sourceTitle: 'Contact information for foreign embassies in Korea (주한공관주소록)',
  publisher: 'Ministry of Foreign Affairs (외교부)',
  checkedAt: CHECKED,
  contentClass: 'A',
  verification: 'verified',
  finalAuthority: 'your own embassy',
  jurisdiction: 'Republic of Korea',
};

/** Each embassy is its own final authority; only the reachable one is confirmed. */
function embassy(
  sourceUrl: string,
  sourceTitle: string,
  publisher: string,
  verification: EmbassyVerification,
): ContentEvidence {
  return {
    sourceUrl,
    sourceTitle,
    publisher,
    checkedAt: CHECKED,
    contentClass: 'B',
    verification,
    finalAuthority: publisher,
  };
}

type EmbassyVerification = Extract<ContentEvidence['verification'], 'verified' | 'needs_review'>;

export const EMERGENCY_SECTIONS: EmergencySection[] = [
  {
    id: 'phones',
    titleEn: 'Emergency phone numbers',
    titleKo: '긴급 전화번호',
    icon: 'Phone',
    items: [
      {
        label: '112 — Police (경찰)',
        detail:
          'Crime, theft, assault, harassment. Free, 24 hours. If you cannot speak Korean, say "English" as soon as the call connects and the operator brings an interpreter onto the line.',
        href: 'tel:112',
        evidence: POLICE,
      },
      {
        label: '119 — Fire and ambulance (소방·구급)',
        detail:
          'Fire, rescue, and medical emergencies. Free, 24 hours. Give the address first, then whether the person is conscious and breathing. Interpretation is added to the call for non-Korean speakers.',
        href: 'tel:119',
        evidence: FIRE_AGENCY,
      },
      {
        label: '1345 — Immigration Contact Center (출입국)',
        detail:
          'Visa, registration, and stay questions in 20 languages. Weekdays 09:00–22:00 KST. After 18:00 only Korean, English, and Chinese are staffed, so this is not a night line.',
        href: 'tel:1345',
        evidence: IMMIGRATION_CONTACT_CENTER,
      },
      {
        label: '1330 — Korea Travel Hotline (관광통역안내)',
        detail:
          '24 hours a day in Korean, English, Japanese, and Chinese. Russian, Vietnamese, Thai, and Malay/Indonesian run 08:00–19:00. It also interprets on three-way calls to other public lines, which makes it the number to try when language is the problem rather than the emergency.',
        href: 'tel:1330',
        evidence: TRAVEL_HOTLINE,
      },
      {
        label: '120 — Seoul city services (다산콜)',
        detail:
          'City information, waste rules, and civil complaints. Foreign-language counselling runs weekdays 09:00–18:00 KST in English, Chinese, Japanese, Vietnamese, and Mongolian: dial 02-120, then 9, then 1 for English or 2 for Chinese.',
        href: 'tel:02-120',
        evidence: SEOUL_DASAN,
      },
    ],
  },
  {
    id: 'medical',
    titleEn: 'English-speaking clinics',
    titleKo: '영어 진료',
    icon: 'Stethoscope',
    items: [
      {
        label: 'Severance Hospital — International Health Care Center',
        detail:
          'Sinchon, 3rd floor. Tel: 02-2228-5800. An outpatient clinic, not an emergency route — for an emergency call 119 or go to the emergency centre.',
        href: 'tel:02-2228-5800',
        evidence: {
          sourceUrl: 'https://sev.severance.healthcare/sev-en/ihc/overview.do',
          sourceTitle: 'International Health Care Center — overview',
          publisher: 'Severance Hospital, Yonsei University Health System',
          checkedAt: CHECKED,
          contentClass: 'B',
          verification: 'verified',
          finalAuthority: 'Severance International Health Care Center',
        },
      },
      {
        label: 'Asan Medical Center — International Healthcare Center',
        detail:
          'Songpa-gu. Tel: 02-3010-5001, int@amc.seoul.kr. Open weekdays 08:30–17:30 KST.',
        href: 'tel:02-3010-5001',
        evidence: {
          sourceUrl: 'https://eng.amc.seoul.kr/gb/lang/specialities/centers.do?hpCd=D100',
          sourceTitle: 'Specialized Centers — International Healthcare Center',
          publisher: 'Asan Medical Center',
          checkedAt: CHECKED,
          contentClass: 'B',
          verification: 'verified',
          finalAuthority: 'Asan International Healthcare Center',
        },
      },
      {
        label: 'Samsung Medical Center — International Health Services',
        detail: 'Irwon-ro, Gangnam-gu. Tel: 02-3410-0200, ihs.smc@samsung.com.',
        href: 'tel:02-3410-0200',
        evidence: {
          sourceUrl: 'https://www.samsunghospital.com/en/international-healthcare-center.do',
          sourceTitle: 'International Healthcare Center',
          publisher: 'Samsung Medical Center',
          checkedAt: CHECKED,
          contentClass: 'B',
          verification: 'verified',
          finalAuthority: 'Samsung Medical Center International Health Services',
        },
      },
      {
        label: 'Pharmacies open late, at night, or on a holiday',
        detail:
          'Search by district, date, and time on the pharmacists association finder. Naming one shop would go stale; this list is maintained.',
        href: 'https://www.pharm114.or.kr/',
        evidence: {
          sourceUrl: 'https://www.pharm114.or.kr/',
          sourceTitle: '휴일지킴이약국 (Holiday and late-night pharmacy finder)',
          publisher: 'Korean Pharmaceutical Association (대한약사회)',
          checkedAt: CHECKED,
          contentClass: 'B',
          verification: 'verified',
          finalAuthority: 'the pharmacy you are calling',
        },
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
        label: 'Lost wallet or phone — start here',
        detail:
          'LOST112 pools found-item reports from police stations nationwide and lets you register what you lost. The site is in Korean; 1330 can interpret while you work through it.',
        href: 'https://www.lost112.go.kr/',
        evidence: {
          sourceUrl: 'https://www.lost112.go.kr/',
          sourceTitle: '경찰청 유실물 종합관리시스템 (LOST112)',
          publisher: 'Korean National Police Agency (경찰청)',
          checkedAt: CHECKED,
          contentClass: 'B',
          verification: 'verified',
          finalAuthority: 'the police station holding the item',
        },
      },
      {
        label: 'Lost passport',
        detail:
          'Contact your embassy first — only they can replace it. Then ask 1345 whether your case requires a report to immigration, and by when. K-Journey does not state that deadline because it depends on your status.',
        evidence: {
          sourceUrl: 'https://www.mofa.go.kr/eng/pgm/m_5789/uss/cnsrshp/inKoEmblgbdAdres.do',
          sourceTitle: 'Contact information for foreign embassies in Korea (주한공관주소록)',
          publisher: 'Ministry of Foreign Affairs (외교부)',
          checkedAt: CHECKED,
          contentClass: 'A',
          verification: 'verified',
          finalAuthority: 'your embassy and Immigration Contact Center 1345',
        },
      },
      {
        label: 'Left on the subway',
        detail:
          'Seoul Metro runs four lost-and-found centres, weekdays 09:00–18:00 KST, closed weekends and holidays. Lines 1–2: 02-6110-1122. Lines 3–4: 02-6110-3344. Lines 5 and 8: 02-6311-6765. Lines 6 and 7: 02-6311-6766. Items move to police custody after about a week, so check LOST112 too.',
        href: 'https://www.smrte.co.kr/support/lost',
        evidence: {
          sourceUrl: 'https://www.smrte.co.kr/support/lost',
          sourceTitle: '서울 지하철 유실물센터 이용안내',
          publisher: 'Seoul Transportation Corporation (서울교통공사)',
          checkedAt: CHECKED,
          contentClass: 'B',
          verification: 'verified',
          finalAuthority: 'the lost-and-found centre for your line',
          jurisdiction: 'Seoul',
        },
      },
      {
        label: 'Left in a taxi or on a bus',
        detail:
          'Seoul runs one lost-and-found service across city buses, village buses, and both taxi types. Have the time, the route or plate, and where you got off. 120 can look up the registration status for you.',
        href: 'https://news.seoul.go.kr/traffic/find',
        evidence: {
          sourceUrl: 'https://news.seoul.go.kr/traffic/find',
          sourceTitle: '대중교통 분실물센터 (Public transport lost and found)',
          publisher: 'Seoul Metropolitan Government (서울특별시)',
          checkedAt: CHECKED,
          contentClass: 'B',
          verification: 'verified',
          finalAuthority: 'Seoul 120 Dasan Call Center',
          jurisdiction: 'Seoul',
        },
      },
    ],
  },
  {
    id: 'phrases',
    titleEn: 'Emergency Korean phrases',
    titleKo: '긴급 한국어',
    icon: 'MessageCircle',
    items: [
      { label: '도와주세요 (do-wa-ju-se-yo)', detail: 'Help me.', evidence: phrase() },
      {
        label: '응급실이 어디예요? (eung-geup-sil-i eo-di-ye-yo)',
        detail: 'Where is the emergency room?',
        evidence: phrase(),
      },
      { label: '아파요 (a-pa-yo)', detail: "I'm hurting. I'm in pain.", evidence: phrase() },
      {
        label: '경찰을 불러주세요 (gyeong-chal-eul bul-leo-ju-se-yo)',
        detail: 'Please call the police.',
        evidence: phrase(),
      },
      {
        label: '저는 외국인이에요 (jeo-neun oe-guk-in-i-e-yo)',
        detail: "I'm a foreigner. Use this to signal that you need an interpreter.",
        evidence: phrase(),
      },
    ],
  },
  {
    id: 'embassies',
    titleEn: 'Embassy contacts',
    titleKo: '대사관 연락처',
    icon: 'Flag',
    items: [
      {
        label: 'Find your own embassy',
        detail:
          'The Ministry of Foreign Affairs publishes every foreign mission in Korea with its address and telephone number, in English. Start here if your country is not listed below.',
        href: 'https://www.mofa.go.kr/eng/pgm/m_5789/uss/cnsrshp/inKoEmblgbdAdres.do',
        evidence: MOFA_EMBASSY_DIRECTORY,
      },
      {
        label: 'United States',
        detail:
          'Jongno-gu, 188 Sejong-daero. Tel: 02-397-4114, which is also the after-hours duty officer.',
        href: 'tel:02-397-4114',
        evidence: embassy(
          'https://kr.usembassy.gov/contact-us/',
          'Contact us — U.S. Embassy and Consulate in the Republic of Korea',
          'U.S. Embassy Seoul',
          'verified',
        ),
      },
      {
        label: 'United Kingdom',
        detail:
          'Jung-gu, Sejong-daero 19-gil 24. Tel: 02-3210-5500. The embassy now routes enquiries and emergencies through an online contact form, so use its site first.',
        href: 'https://www.gov.uk/world/organisations/british-embassy-seoul',
        evidence: embassy(
          'https://www.gov.uk/world/organisations/british-embassy-seoul',
          'British Embassy Seoul',
          'British Embassy Seoul',
          'needs_review',
        ),
      },
      {
        label: 'Canada',
        detail: 'Jung-gu, 21 Jeongdong-gil. Tel: 02-3783-6000.',
        href: 'tel:02-3783-6000',
        evidence: embassy(
          'https://www.international.gc.ca/country-pays/korea-coree/seoul.aspx',
          'Embassy of Canada to Korea',
          'Embassy of Canada to Korea',
          'needs_review',
        ),
      },
      {
        label: 'Australia',
        detail: 'Jongno-gu. Tel: 02-2003-0100.',
        href: 'tel:02-2003-0100',
        evidence: embassy(
          'https://southkorea.embassy.gov.au/',
          'Australian Embassy, Republic of Korea',
          'Australian Embassy Seoul',
          'needs_review',
        ),
      },
      {
        label: 'Germany',
        detail: 'Jung-gu. Tel: 02-748-4114.',
        href: 'tel:02-748-4114',
        evidence: embassy(
          'https://seoul.diplo.de/',
          'German Embassy Seoul',
          'German Embassy Seoul',
          'needs_review',
        ),
      },
      {
        label: 'France',
        detail: 'Seodaemun-gu. Tel: 02-3149-4300.',
        href: 'tel:02-3149-4300',
        evidence: embassy(
          'https://kr.ambafrance.org/',
          'Ambassade de France en Corée',
          'French Embassy Seoul',
          'needs_review',
        ),
      },
    ],
  },
];

/**
 * A translation gloss is a Class C editorial judgement — no institution
 * publishes "도와주세요 means help me". The romanisation, which does have a
 * standard, is the part that carries a source.
 */
function phrase(): ContentEvidence {
  return {
    sourceUrl: 'https://www.korean.go.kr/front/page/pageView.do?page_id=P000148&mn_id=99',
    sourceTitle: '국어의 로마자 표기법 (Revised Romanization of Korean)',
    publisher: 'National Institute of Korean Language (국립국어원)',
    checkedAt: CHECKED,
    contentClass: 'C',
    verification: 'editorial',
    finalAuthority: 'the person you are speaking to',
  };
}

export const EMERGENCY_ITEMS: readonly EmergencyItem[] = EMERGENCY_SECTIONS.flatMap(
  (section) => section.items,
);
