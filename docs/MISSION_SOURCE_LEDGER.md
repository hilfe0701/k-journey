# Mission source ledger

Last checked: 2026-08-29 (KST)

This ledger covers all 55 cultural missions in `src/data/missions.ts`. The
runtime metadata is attached through `MISSION_METADATA` in that module. A
blank source URL is intentional: `unknown` means that no suitable primary
source was identified at the check date, while `editorial` marks experiential
guidance that is not a claim an institution can fully settle. `needs_review`
means a source was opened but does not confirm every claim in the card; it must
not be presented as fully verified.

`completeWhen` is the user-observable completion criterion in the code. The
accountable owner for this catalogue is currently the role
`K-Journey Content Operations`; a named person is still an operational
follow-up.

| ID | Primary source or status | Checked | Class | Verification | Final authority |
|---|---|---:|:---:|---|---|
| `p1_pack` | — | 2026-08-29 | C | `unknown` | university international office |
| `p1_visa` | [Study in Korea — Student Visa and Stay Status](https://www.studyinkorea.go.kr/cmm/plan/visaAndStay.do) | 2026-08-29 | A | `verified` | Korean embassy or consulate handling the application |
| `p1_dorm_rules` | — | 2026-08-29 | B | `unknown` | university dormitory office |
| `p1_offcampus_essentials` | — | 2026-08-29 | C | `unknown` | landlord or housing provider |
| `p1_airport` | [AREX passenger fares and conditions](https://www.arex.or.kr/content.do?menuNo=MN201503060000000002) | 2026-08-29 | B | `needs_review` | selected transport operator |
| `p1_emergency` | [Immigration Contact Center 1345](https://www.moj.go.kr/moj/196/subview.do) | 2026-08-29 | A | `needs_review` | 112, 119, 1345, or 1330 as appropriate |
| `p1_apps` | [KakaoTalk service](https://www.kakaocorp.com/page/service/service/KakaoTalk) | 2026-08-29 | C | `needs_review` | each app provider |
| `p1_greetings` | [Revised Romanization of Korean](https://www.korean.go.kr/front/page/pageView.do?page_id=P000148&mn_id=99) | 2026-08-29 | C | `editorial` | person the learner is speaking with |
| `p1_weather` | [Korea weather service](https://www.weather.go.kr/w/) | 2026-08-29 | C | `needs_review` | Korea Meteorological Administration |
| `p2_tmoney` | [Public transportation and T-money purchase information](https://english.visitseoul.net/transportation/Transportation-in-Seoul_/6398) | 2026-08-29 | B | `needs_review` | T-money customer service or issuing retailer |
| `p2_sim` | [KT telecommunications](https://www.kt.com/) | 2026-08-29 | A | `needs_review` | selected mobile carrier |
| `p2_arc` | [HiKorea immigration services](https://www.hikorea.go.kr/Main.pt) | 2026-08-29 | A | `verified` | HiKorea and local immigration office |
| `p2_bank` | [Bank of Korea](https://www.bok.or.kr/eng/main/main.do) | 2026-08-29 | A | `needs_review` | chosen bank branch |
| `p2_dorm_checkin` | — | 2026-08-29 | B | `unknown` | university dormitory office |
| `p2_offcampus_utilities` | [Korea Electric Power](https://home.kepco.co.kr/) | 2026-08-29 | B | `needs_review` | landlord and utility providers |
| `p2_offcampus_laundry` | — | 2026-08-29 | C | `unknown` | laundromat shown in the learner’s map |
| `p2_campus` | — | 2026-08-29 | B | `unknown` | university campus services |
| `p2_grocery` | [Visit Korea](https://english.visitkorea.or.kr/svc/main/index.do) | 2026-08-29 | C | `editorial` | store the learner plans to visit |
| `p2_recycle` | [Seoul Metropolitan Government](https://english.seoul.go.kr/) | 2026-08-29 | B | `needs_review` | district office or building manager |
| `p2_delivery` | [Baemin](https://www.baemin.com/) | 2026-08-29 | C | `needs_review` | selected delivery platform |
| `p2_first_meal` | — | 2026-08-29 | C | `editorial` | restaurant serving the meal |
| `p2_first_friend` | — | 2026-08-29 | C | `unknown` | university buddy or exchange office |
| `p2_transit` | [Seoul transportation](https://english.seoul.go.kr/service/movement/) | 2026-08-29 | B | `needs_review` | operator serving the route |
| `p3_market` | [Visit Korea — About Korean Food](https://english.visitkorea.or.kr/svc/contents/infoBscView.do?menuSn=460&vcontsId=140727) | 2026-08-29 | C | `editorial` | market stall or management office |
| `p3_streetfood` | [Visit Korea — About Korean Food](https://english.visitkorea.or.kr/svc/contents/infoBscView.do?menuSn=460&vcontsId=140727) | 2026-08-29 | C | `editorial` | vendor serving the food |
| `p3_extreme` | — | 2026-08-29 | C | `unknown` | restaurant or food vendor |
| `p3_samgyeopsal` | [Visit Korea — About Korean Food](https://english.visitkorea.or.kr/svc/contents/infoBscView.do?menuSn=460&vcontsId=140727) | 2026-08-29 | C | `editorial` | restaurant serving the meal |
| `p3_cu_combo` | [CU convenience store](https://cu.bgfretail.com/) | 2026-08-29 | C | `needs_review` | convenience-store brand and branch |
| `p3_tea` | [Seoul Tourism — Insadong](https://english.visitseoul.net/attractions/Insadong_/255) | 2026-08-29 | C | `editorial` | tea house the learner visits |
| `p3_hangang` | [Hangang Parks](https://hangang.seoul.go.kr/) | 2026-08-29 | B | `needs_review` | relevant Hangang park office |
| `p3_hike` | [Seoul Metropolitan Government](https://english.seoul.go.kr/) | 2026-08-29 | B | `needs_review` | relevant park or trail authority |
| `p3_ktx` | [KORAIL train reservation](https://smart.letskorail.com/ebizbf/EbizBfTicketSearchM.do?hidJobDv=NRM) | 2026-08-29 | B | `needs_review` | KORAIL for selected train and fare |
| `p3_festival` | [Visit Korea](https://english.visitkorea.or.kr/) | 2026-08-29 | C | `needs_review` | festival’s official organizer |
| `p3_jjimjilbang` | [Visit Korea](https://english.visitkorea.or.kr/svc/main/index.do) | 2026-08-29 | C | `editorial` | jjimjilbang the learner visits |
| `p3_noraebang` | — | 2026-08-29 | C | `editorial` | noraebang the learner visits |
| `p3_pcbang` | — | 2026-08-29 | C | `editorial` | PC bang the learner visits |
| `p3_pojangmacha` | [Visit Korea](https://english.visitkorea.or.kr/svc/main/index.do) | 2026-08-29 | C | `editorial` | stall or market management office |
| `p3_hanbok` | [Free Admission Guidelines for Hanbok Wearers](https://royal.cha.go.kr/ENG/contents/E701000000.do) | 2026-08-29 | B | `verified` | palace or royal-site admission office |
| `p3_museum` | [National Museum visitor information](https://www.museum.go.kr/ENG/contents/E0101000000.do) | 2026-08-29 | B | `verified` | National Museum visitor information desk |
| `p3_dojang` | — | 2026-08-29 | C | `editorial` | seal carver or shop |
| `p3_templestay` | [Templestay program information](https://www.templestay.com/en/MI000000000000000019/temple/introView.do?templeId=InternationalSeonCenter) | 2026-08-29 | C | `verified` | temple hosting the selected program |
| `p3_movie` | [CGV cinema booking](https://www.cgv.co.kr/) | 2026-08-29 | C | `needs_review` | cinema chain and theater |
| `p3_kpop` | [Seoul Metropolitan Government](https://english.seoul.go.kr/) | 2026-08-29 | C | `needs_review` | performance organizer or venue |
| `p3_bus_transfer` | [Seoul transportation](https://english.seoul.go.kr/service/movement/) | 2026-08-29 | B | `needs_review` | transport operator |
| `p3_korean_order` | — | 2026-08-29 | C | `editorial` | delivery platform and restaurant |
| `p3_cafe` | — | 2026-08-29 | C | `editorial` | study café |
| `p3_clinic` | [National health insurance medical-service fee notice](https://www.mohw.go.kr/board.es?mid=a10409020000&bid=0026&list_no=1487937) | 2026-08-29 | B | `needs_review` | clinic, NHIS, and Ministry of Health and Welfare |
| `p3_cooking` | [Maangchi Korean recipes](https://www.maangchi.com/) | 2026-08-29 | C | `editorial` | recipe author and ingredient packaging |
| `p4_customs` | [Korea Customs Service](https://customs.go.kr/english/main.do?hs=100700) | 2026-08-29 | A | `needs_review` | destination-country customs authority |
| `p4_gifts` | [Visit Korea shopping information](https://english.visitkorea.or.kr/svc/main/index.do) | 2026-08-29 | C | `needs_review` | retailer and product label |
| `p4_pack_out` | — | 2026-08-29 | B | `unknown` | learner’s airline |
| `p4_dorm_out` | — | 2026-08-29 | B | `unknown` | university dormitory office |
| `p4_offcampus_lease` | — | 2026-08-29 | A | `unknown` | landlord, broker, and district office |
| `p4_farewell` | — | 2026-08-29 | C | `editorial` | people attending the farewell |
| `p4_last_meal` | — | 2026-08-29 | C | `editorial` | restaurant or food vendor |

## Review queue

The `needs_review` and `unknown` rows are deliberately visible in the
catalogue. Before release, re-open every Class A/B source, replace any stale
URL, and either confirm the claim or remove the unsupported precision from the
card. Exact prices, opening hours, routes, and seasonal event dates should be
treated as volatile even when the surrounding activity remains useful.
