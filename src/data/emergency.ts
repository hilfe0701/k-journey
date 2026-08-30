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
 * The five embassies that could not be opened on 2026-08-04 were re-checked on
 * 2026-08-06 against their own governments' pages, which changed four of them:
 *
 *  - Canada's URL 404ed. Global Affairs moved the post page from
 *    `korea-coree` to `republic_korea-republique_coree`.
 *  - France's `kr.ambafrance.org` now 301s to `kr.diplomatie.gouv.fr`, and the
 *    French government directory publishes a duty number the app did not have.
 *  - Germany and Australia both publish an after-hours line the app omitted.
 *  - gov.uk publishes no telephone number for the Seoul post at all. It routes
 *    emergencies through a contact form, so the number the app carried is
 *    removed rather than re-sourced — the same call made for the US
 *    after-hours line and LOST112's English support.
 *
 * The Ministry of Foreign Affairs directory still leads the section, which is
 * the only entry that serves a reader whose country is not one of the six.
 */

import type { ContentEvidence } from '../lib/contentEvidence';

export interface EmergencyItem {
  label: string;
  detail: string;
  /** The action the reader takes: `tel:` to dial, `https:` to open a service. */
  href?: string;
  evidence: ContentEvidence;
  /** Separate provenance for language-access instructions on emergency lines. */
  languageSupport?: EmergencyLanguageSupport;
}

export interface EmergencyLanguageSupport {
  /** `needs_review` is intentional when the official source does not state the current call flow. */
  verification: Extract<ContentEvidence['verification'], 'verified' | 'needs_review'>;
  detail: string;
  evidence: ContentEvidence;
  finalAuthority: string;
}

export interface EmergencySection {
  id: string;
  titleEn: string;
  titleKo: string;
  icon: string;
  items: EmergencyItem[];
}

const CHECKED = '2026-08-04';

/** The embassy re-check that closed the five `needs_review` entries. */
const EMBASSY_CHECKED = '2026-08-06';

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

const POLICE_LANGUAGE_SUPPORT: ContentEvidence = {
  sourceUrl:
    'https://www.police.go.kr/user/bbs/BD_selectBbs.do?q_bbsCode=1004&q_bbscttSn=20260223174650936',
  sourceTitle: '112신고 외국어 통역센터 채용 공고',
  publisher: 'Korean National Police Agency (경찰청)',
  checkedAt: '2026-08-29',
  contentClass: 'A',
  verification: 'verified',
  finalAuthority: '112',
  jurisdiction: 'Republic of Korea',
};

const FIRE_LANGUAGE_SUPPORT: ContentEvidence = {
  sourceUrl:
    'https://www.nfa.go.kr/nfa/news/pressrelease/press/?boardId=bbs_0000000000000010&category=&cntId=352&mode=view&pageIdx=++++3',
  sourceTitle: '119신고앱 영문서비스 시행 및 외국인 신고 안내',
  publisher: 'National Fire Agency (소방청)',
  checkedAt: '2026-08-29',
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

/** Each embassy is its own final authority. */
function embassy(
  sourceUrl: string,
  sourceTitle: string,
  publisher: string,
  verification: EmbassyVerification,
  checkedAt: string = EMBASSY_CHECKED,
): ContentEvidence {
  return {
    sourceUrl,
    sourceTitle,
    publisher,
    checkedAt,
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
          'Crime, theft, assault, harassment. Free, 24 hours. If you cannot speak Korean, ask for an interpreter when the call connects. The current languages and connection steps can vary, so confirm with the operator.',
        href: 'tel:112',
        evidence: POLICE,
        languageSupport: {
          verification: 'verified',
          detail:
            'The National Police Agency publishes a 112 foreign-language interpretation centre. Ask the 112 operator for an interpreter; the source does not promise a fixed language list or a particular phrase.',
          evidence: POLICE_LANGUAGE_SUPPORT,
          finalAuthority: '112',
        },
      },
      {
        label: '119 — Fire and ambulance (소방·구급)',
        detail:
          'Fire, rescue, and medical emergencies. Free, 24 hours. Give the address first, then whether the person is conscious and breathing. If speaking Korean is difficult, dial 119 and use the NFA video/app reporting options when available; direct phone interpretation is not confirmed here.',
        href: 'tel:119',
        evidence: FIRE_AGENCY,
        languageSupport: {
          verification: 'needs_review',
          detail:
            'The National Fire Agency documents an English 119 report app and says video reporting is useful for foreigners. It does not state the current languages or a direct voice-interpreter connection flow on the checked page; ask 119 or 1330 if you need live interpretation.',
          evidence: FIRE_LANGUAGE_SUPPORT,
          finalAuthority: '119 and Korea Travel Hotline 1330',
        },
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
          CHECKED,
        ),
      },
      {
        label: 'United Kingdom',
        detail:
          'Jung-gu, Sejong-daero 19-gil 24 (04519). gov.uk publishes no telephone number for this post — it says to use its contact form to call in an emergency or send an enquiry, so start there.',
        href: 'https://www.gov.uk/world/organisations/british-embassy-seoul',
        evidence: embassy(
          'https://www.gov.uk/world/organisations/british-embassy-seoul',
          'British Embassy Seoul',
          'British Embassy Seoul',
          'verified',
        ),
      },
      {
        label: 'Canada',
        detail:
          'Jung-gu, 21 Jeongdong-gil (04518). Tel: 02-3783-6000, seoul@international.gc.ca. Emergency consular assistance runs 24/7 — seoul-cs@international.gc.ca outside office hours.',
        href: 'tel:02-3783-6000',
        evidence: embassy(
          'https://www.international.gc.ca/country-pays/republic_korea-republique_coree/seoul.aspx?lang=eng',
          'Embassy of Canada to the Republic of Korea, in Seoul',
          'Embassy of Canada to the Republic of Korea',
          'verified',
        ),
      },
      {
        label: 'Australia',
        detail:
          'Jongno-gu, 19th floor Kyobo Building, 1 Jong-ro (03154). Tel: 02-2003-0100. The 24-hour Consular Emergency Centre is +61 2 6261 3305.',
        href: 'tel:02-2003-0100',
        evidence: embassy(
          'https://southkorea.embassy.gov.au/seol/contact.html',
          'Contact us — Australian Embassy, Republic of Korea',
          'Australian Embassy Seoul',
          'verified',
        ),
      },
      {
        label: 'Germany',
        detail:
          'Jung-gu, 8th floor Seoul Square, 416 Hangang-daero (04637). Tel: 02-748-4114. Out of hours the embassy publishes 010-5240-7124 for emergencies.',
        href: 'tel:02-748-4114',
        evidence: embassy(
          'https://seoul.diplo.de/',
          'Deutsche Botschaft Seoul',
          'German Embassy Seoul',
          'verified',
        ),
      },
      {
        label: 'France',
        detail:
          'Seodaemun-gu, 43-12 Seosomun-ro (03741). Tel: 02-3149-4300. The emergency number is 010-8753-3276.',
        href: 'tel:02-3149-4300',
        evidence: embassy(
          'https://lannuaire.service-public.gouv.fr/ambassades/c06c38df-4ec8-4925-9111-96ec150d294b',
          'Ambassade de France en Corée du Sud — annuaire officiel',
          'French Embassy Seoul',
          'verified',
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
