# GBSN Social Logistics Challenge â€” Nigeria Landscape Research

_Compiled 29 October 2026 Â· Deep-research: 3 rounds, 13 search angles_

---

## 1. The Challenge Landscape

- **Format:** Teams of 2â€“5 enrolled students (undergrad/grad), virtual, international. Choose a **local problem in a community you know** within one of 4 tracks. Deliverables: ~10-page double-spaced written report (PDF, evidence-based business solution) + **creative illustration** (video, infographic, or prototype). Solutions tied to UN SDGs and judged on "strength of analysis and creativity of the proposed **business** solution."
- **Timeline:** Registration Nov 1, 2026 Â· Submission Nov 15, 2026 Â· Top 5 announced Nov 23 Â· Finals Dec 1â€“2 Â· Winner Dec 7.
- **Prizes:** $5,000 (1st), $1,000 (2nd and 3rd). Micro-credential for participants.
- **Judges of note:** Dr. Obiora Madu (Multimix Group, **Nigeria**), George Fenton (Humanitarian Logistics Association), Diego Vega & Pamela Steele (health/humanitarian supply chain experts). Sponsor: LEARN LOGISTICS by **KÃ¼hne Foundation**.
- **Implication:** A Nigeria-based team has home-field advantage â€” a judge from Nigeria, a strong local evidence base, and the brief explicitly rewards local knowledge.

---

## 2. Nigeria's Problems by Track (with evidence)

### Track A â€” Health & Humanitarian Supply Chains â­ (recommended)

| Evidence                                                                                                                                                                                                                                                            | Source                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Community health workers (CHWs) stock out of essential medicines **~29% of the time** â€” 3Ã— higher than their affiliated health centers (9%), and worsening since 2015                                                                                            | Hum Resour Health systematic review, 2022  |
| **41.7% of 1,050** Nigerian service delivery points had a contraceptive stockout in 3 months (2024 survey); **delays >2 weeks between ordering and delivery = strongest predictor** of stockout (OR 1.76); monthly supervision visits significantly lower stockouts | Studies in Family Planning, 2026           |
| Nigeria's digital line of sight "largely ended at the LGA â€” **~20,000 primary health facilities still rely on paper stock records**"                                                                                                                              | VillageReach, Aug 2026                     |
| OpenLMIS covers all **835 vaccine cold stores** but "is **not currently deployed at the health facility level**"                                                                                                                                                    | PLOS Global Public Health evaluation, 2026 |
| OpenLMIS in Nigeria saved **850,000+ vaccine doses from expiry** â€” proof digital logistics works at Nigerian scale                                                                                                                                                | OpenLMIS, 2025                             |
| DHIS2 dashboards already trigger manual **redistribution from neighboring facilities** on stockout â€” but it's uncoordinated and undocumented                                                                                                                      | DHIS2 case study, 2023                     |
| Only 28.6% of facilities had functional thermometers in vaccine stores; poor data management repeatedly cited                                                                                                                                                       | Scoping review, 2021                       |
| Zipline expanding (3 hubs â†’ 12 more, targeting 20,000 facilities) â€” but it's a capital-heavy vertical layer, not peer coordination                                                                                                                              | TechCabal via allAfrica, May 2026          |

### Track B â€” Food Systems & Agricultural Logistics

- â‚¦3.5â€“5 **trillion** in post-harvest losses in 2025 (OTACCWA). Tomato losses reach **50% at farmgate**; cassava/yam 20â€“50%. High transport costs (81% of farmers cite as constraint).
- **Caution: crowded space.** ColdHubs, Koolboks ($11M Series A, 10,000+ units), Coldbox Store/Manamuz (already a cold-room marketplace app), Gricd (IoT Frij), Ecotutu, SokoFresh. A student team competes head-on with funded startups.

### Track C â€” Urban Access & Mobility

- Informal settlement waste/collection logistics; last-mile for low-income urban residents. Least location-specific evidence surfaced in research; would need primary fieldwork.

### Track D â€” Circular & Environmental Logistics

- ~**100,000 informal workers** process 500,000+ tonnes of e-waste yearly; only 15â€“20% formally collected; 60,000+ tonnes of used electronics imported annually. Gocycle.ng founder: _"Africa does not have an e-waste supply problem, but a **logistics problem**"_ â€” Babanbola collectors are cash-based, undocumented, no fixed addresses.
- **Caution:** Scrapays, Wecyclers, Chanja Datti, RecyclePoints, Gocycle already digitize parts of this chain in Lagos/Abuja.

---

## 3. The Isolated Problem â­

> **Nigeria's ~20,000 primary health facilities track medicines on paper and order bimonthly, so stockouts surface late and resupply takes over two weeks â€” leaving clinics without essential medicines while surplus sits unused in neighboring facilities.**

_(34 words)_

### Why this one wins

1. **It's the documented gap, not the obvious one.** Zipline, OpenLMIS, NHLMIS, LMVSV all attack _vertical_ resupply (national/state/LGA â†’ facility). Nobody owns _lateral_ resupply (facility â†” facility peer sharing) â€” which DHIS2 Nigeria already names as the remedy and academia proves: lateral transshipment cuts shortages ~30% and delivery time ~10â€“15% in blood/platelet supply chains.
2. **Perfectly matches "software + people + light hardware":** an offline-first app (USSD/SMS/WhatsApp fallback) where facilities report stock; the system matches stockouts to nearby surplus and dispatches motorcycle riders for verified transfers. People = riders, LGA cold chain officers, facility focal persons. Hardware (optional) = solar-powered IoT temperature loggers for cold items.
3. **Complements, not competes with** the national system â€” judges from the health-logistics world (Steele, Vega, Fenton) will recognize the systems-thinking.
4. **Killer proof points:** OpenLMIS Nigeria saved 850k doses (digital works); cStock Malawi proved SMS reporting + resupply at community level nationwide (29 districts); >2-week delay is the strongest stockout predictor (fix exactly that); monthly supervision reduces stockouts (the product embeds supervision).
5. **Business model exists:** per-transfer commission from private facilities/pharmacies, LGA/state government SaaS contracts, NGO/donor partnerships (CHAI, VillageReach, JSI already fund this space).

---

## 4. Open-Source Resources to Build On

| Tool                                           | What it gives you                                                                                                                                                                                  | License / scale                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **OpenBoxes** (github.com/openboxes/openboxes) | WMS + inventory + lot/expiry tracking, **built by Partners In Health for exactly this context** (Haiti â†’ Sierra Leone, Liberia, Rwanda). Has live demo + Docker image.                           | EPL-1.0, 900+ â­, 12.7k commits             |
| **OpenLMIS** (openlmis.org)                    | Electronic LMIS purpose-built for health commodities in LMICs; **already running in Nigeria (NG-OpenLMIS, 835 cold stores)**; requisitionâ†’fulfillmentâ†’POD workflow; RTM/cold-chain integration | AGPL-3.0, 11,000+ facilities in 8 countries |
| **Fleetbase** (github.com/fleetbase/fleetbase) | Open-source logistics OS: dispatch, **route optimization, live rider tracking, proof-of-delivery** â€” the mobility/dispatch layer for the rider network                                           | AGPL-3.0, 4.4k â­                           |
| **DHIS2** (dhis2.org)                          | Nigeria's actual national HMIS; supports SMS/commodity tracking + LMIS integration; the design precedent ("dashboard â†’ redistribution") is already documented                                    | Open source                                 |
| **cStock / SC4CCM** (sc4ccm.jsi.com)           | The proven _model_ to copy: 2 SMS data points/month â†’ auto-calculated resupply â†’ alerts. Reference architecture, not necessarily code                                                          | JSI/USAID                                   |
| **CommCare Supply** (Dimagi)                   | Off-the-shelf mobile CHW stock-reporting app, offline-first                                                                                                                                        | Open core                                   |
| **Africa's Talking**                           | USSD/SMS gateway APIs with Nigerian operator coverage â€” how the offline facility users connect                                                                                                   | Commercial API, sandbox free                |
| **LaDe dataset** (github.com/wenhaomin/LaDe)   | Million-package last-mile delivery dataset (Cainiao) â€” useful for route/ETA modeling in the report                                                                                               | Open data                                   |

**Suggested stack for a prototype:** OpenBoxes or OpenLMIS (inventory + matching) + Fleetbase (rider dispatch & POD) + Africa's Talking USSD/SMS (facility reporting) â€” all open source, all dockerizable, demo-able in days.

---

## 5. Sources (key)

1. GBSN â€” The Social Logistics Challenge: https://gbsn.org/slc
2. CHW stockouts systematic review: https://pubmed.ncbi.nlm.nih.gov/35840965
3. Contraceptive stockouts Nigeria 2026: https://pubmed.ncbi.nlm.nih.gov/41565606
4. Medicines & vaccines supply chains Nigeria (scoping review): https://pmc.ncbi.nlm.nih.gov/articles/PMC8727467/
5. OpenLMIS Nigeria / 850k doses: https://openlmis.org/how-openlmis-in-nigeria-helped-save-850000-vaccine-doses-from-expiry
6. OpenLMIS Nigeria evaluation (PLOS, 2026): https://journals.plos.org/globalpublichealth/article?id=10.1371%2Fjournal.pgph.0005581
7. VillageReach â€” LMVSV, ~20,000 paper facilities: https://www.villagereach.org/2026/08/21/bringing-nigerias-vaccine-last-mile-into-view
8. DHIS2 Nigeria vaccine logistics / redistribution: https://dhis2.org/nigeria-vaccine-logistics/
9. cStock (SC4CCM/JSI): https://sc4ccm.jsi.com/the-cstock-journey
10. OTACCWA â‚¦3.5â€“5tn post-harvest losses: https://guardian.ng/news/nigeria-needs-cold-chain-infrastructure-to-curb-n3-5tr-post-harvest-losses/
11. Gocycle e-waste logistics essay: https://guardian.ng/technology/how-informal-collectors-can-support-africas-e-waste-economy
12. ILO e-waste Nigeria: https://www.ilo.org/media/404451/download
13. Fleetbase: https://github.com/fleetbase/fleetbase Â· OpenBoxes: https://github.com/openboxes/openboxes
14. Lateral transshipment evidence: https://www.mdpi.com/2071-1050/12/12/5081 (and blood-chain refs above)
15. NHLMIS / NPSCMP framework: https://nscip.gov.ng/wp-content/uploads/2024/04/National-Oversight-Framework_RTA-1.pdf
