import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScenarioId } from '@supplai/contracts';
import type { ThemeColors } from '../lib/theme';
import { Press, ShieldIcon, FlagIcon, LockIcon } from './ui';

export interface ScenarioLabRunnerProps {
  colors: ThemeColors;
  isDark: boolean;
  uiScale: number;
}

interface ScenarioMeta {
  id: ScenarioId;
  chipLabel: string;
  name: string;
  goal: string;
  expectedOutcome: string;
  defaultTick: number;
  steps: Array<{
    tick: number;
    title: string;
    detail: string;
    owner: string;
    evidence: string;
  }>;
}

const SCENARIOS: ScenarioMeta[] = [
  {
    id: 'authorised-ambient-transfer',
    chipLabel: 'S1: Authorised',
    name: 'Scenario 1: Authorised Ambient Transfer',
    goal: 'Golden path: ORS transfer with safety-floor check, tamper seal #7842, and PIN handover.',
    expectedOutcome: 'authorised_transfer_received',
    defaultTick: 4,
    steps: [
      {
        tick: 1,
        title: 'Stockout Request Created',
        detail:
          'Aiyetoro Central PHC requests 20 ORS sachets due to zero on-hand stock.',
        owner: 'Requester (Aiyetoro Central)',
        evidence: 'Inbound request event #EV-101 logged in ledger',
      },
      {
        tick: 2,
        title: 'Source Custodian Confirmed',
        detail:
          'Idera PHC confirms 20 sachets. Safety floor (20 sachets) protected.',
        owner: 'Source Custodian (Idera PHC)',
        evidence: 'Authorization #AUTH-402, Batch B209 verified',
      },
      {
        tick: 3,
        title: 'Courier Dispatched & Sealed',
        detail: 'Courier Ade Okafor dispatched with sealed tamper crate #7842.',
        owner: 'Courier (Ade Okafor)',
        evidence: 'Tamper seal #7842 scanned, 4-digit PIN generated',
      },
      {
        tick: 4,
        title: 'In Transit on Corridor',
        detail:
          'Rider moving along Aiyetoro–Idera corridor. Real-time telemetry active.',
        owner: 'Courier (Ade Okafor)',
        evidence: 'OSM telemetry active, ETA 4 min',
      },
      {
        tick: 5,
        title: 'Receiver Custody Verified',
        detail:
          'Aiyetoro Central enters Handover PIN 5082. Paired stock movements written to ledger.',
        owner: 'Receiver (Aiyetoro Central)',
        evidence:
          'Movement #MOV-901 (-20) & #MOV-902 (+20) committed transactionally',
      },
    ],
  },
  {
    id: 'source-safety-floor-breach',
    chipLabel: 'S2: Safety Floor',
    name: 'Scenario 2: Source Safety-Floor Protection',
    goal: 'Clinic inventory must never drop below 30 units; surplus capped and remainder escalated.',
    expectedOutcome: 'declined_safety_floor_protected',
    defaultTick: 3,
    steps: [
      {
        tick: 1,
        title: 'High Demand Request Created',
        detail:
          'Aiyetoro Central requests 60 ORS sachets during seasonal diarrheal surge.',
        owner: 'Requester (Aiyetoro Central)',
        evidence: 'Request #REQ-304 received via console',
      },
      {
        tick: 2,
        title: 'Safety Floor Boundary Evaluated',
        detail:
          'Algorithm evaluates Idera PHC stock (50 units). 30-unit safety floor allows max 20 surplus.',
        owner: 'System Allocation Engine',
        evidence: 'Evaluation: On-hand 50 - Floor 30 = Max 20 transferable',
      },
      {
        tick: 3,
        title: 'Allocation Capped to 20 Units',
        detail:
          'Source approves capped 20 units; 40 units blocked to protect local pediatric patients.',
        owner: 'Source Custodian (Idera PHC)',
        evidence:
          'Capped release #REL-209 for 20 units; safety floor preserved',
      },
      {
        tick: 4,
        title: 'Deficit Escalated to Central Store',
        detail:
          'System escalates 40 units deficit to Ota Central Medical Store for routine buffer dispatch.',
        owner: 'LGA Operations Dispatcher',
        evidence: 'Escalation ticket #ESC-810 created for LGA Medical Store',
      },
    ],
  },
  {
    id: 'shelf-batch-mismatch',
    chipLabel: 'S3: Batch Mismatch',
    name: 'Scenario 3: Shelf & Batch Number Mismatch',
    goal: 'Catch mismatch between app allocation and physical shelf stock at the source dispatch gate.',
    expectedOutcome: 'quarantined_shelf_mismatch',
    defaultTick: 2,
    steps: [
      {
        tick: 1,
        title: 'Allocation Dispatched for Batch B209',
        detail: 'System allocates 30 ORS sachets under lot Batch B209.',
        owner: 'System Allocation Engine',
        evidence: 'Dispatch order #ORD-501 issued for Batch B209',
      },
      {
        tick: 2,
        title: 'Physical Shelf Mismatch Flagged',
        detail:
          'Dispenser scans shelf box and discovers Batch B201 instead of allocated B209.',
        owner: 'Source Custodian (Dispenser)',
        evidence: 'Barcode scan mismatch: physical B201 != allocated B209',
      },
      {
        tick: 3,
        title: 'Dispatch Halted & Lot Quarantined',
        detail:
          'Dispatch blocked; lot placed in physical quarantine for pharmacist audit.',
        owner: 'Facility In-Charge',
        evidence: 'Quarantine notice #Q-018 logged; transfer aborted safely',
      },
    ],
  },
  {
    id: 'fefo-priority-reroute',
    chipLabel: 'S4: FEFO Route',
    name: 'Scenario 4: First-Expired, First-Out (FEFO) Priority',
    goal: 'Automate FEFO distribution by allocating stock expiring soonest to high-throughput clinics.',
    expectedOutcome: 'rerouted_fefo_priority',
    defaultTick: 3,
    steps: [
      {
        tick: 1,
        title: 'Urgent Request for Zinc Dispersible',
        detail: 'Aiyetoro Central requests 40 Zinc 20 mg dispersible tablets.',
        owner: 'Requester (Aiyetoro Central)',
        evidence: 'Inbound request for Zinc 20 mg',
      },
      {
        tick: 2,
        title: 'FEFO Comparator Evaluates Batches',
        detail:
          'Algorithm compares Batch B209 (Exp: 6 mo) vs Batch B214 (Exp: 24 mo) across 3 clinics.',
        owner: 'FEFO Optimization Algorithm',
        evidence:
          'Shelf life delta: B209 (180 days) prioritized over B214 (720 days)',
      },
      {
        tick: 3,
        title: 'Near-Expiry Batch B209 Allocated',
        detail:
          'Batch B209 selected to prevent medicine expiry wastage in lower-volume facility.',
        owner: 'Source Custodian',
        evidence:
          'Transfer voucher #FEFO-88 specifies Batch B209 (Exp 10/2026)',
      },
      {
        tick: 4,
        title: 'Courier Dispatched with Priority Seal',
        detail:
          'Courier Babatunde Alabi dispatched with yellow FEFO-priority tamper seal.',
        owner: 'Courier (Babatunde Alabi)',
        evidence: 'Priority tamper seal #FEFO-770 active',
      },
      {
        tick: 5,
        title: 'Custody Transferred & Waste Prevented',
        detail:
          'Receiving clinic logs Batch B209 for fast-track dispensing to active pediatric patients.',
        owner: 'Receiver (Aiyetoro Central)',
        evidence: 'Dispense queue #DQ-44 committed; zero expired wastage',
      },
    ],
  },
  {
    id: 'delayed-rider-eta-adjustment',
    chipLabel: 'S5: Courier Delay',
    name: 'Scenario 5: Courier Delay & Dynamic ETA Adjustment',
    goal: 'Handle en-route delays gracefully with dynamic telemetry ETA updates and receiver alert.',
    expectedOutcome: 'delayed_eta_escalated',
    defaultTick: 4,
    steps: [
      {
        tick: 1,
        title: 'Emergency Transfer Dispatched',
        detail:
          'Iyana-Ipaja PHC emergency ORS replenishment departs Idera PHC (initial ETA 6 min).',
        owner: 'Courier (Ade Okafor)',
        evidence: 'Courier dispatch logged at 13:03',
      },
      {
        tick: 2,
        title: 'Heavy Rain & Road Obstruction',
        detail:
          'Rider encounters flooded culvert on corridor; speed drops below 5 km/h.',
        owner: 'Courier (Ade Okafor)',
        evidence: 'Telemetry anomaly flag: vehicle speed < 5 km/h for > 5 min',
      },
      {
        tick: 3,
        title: 'Dynamic ETA Recalibrated',
        detail:
          'System dynamically adjusts ETA from 6 min to 28 min based on GPS velocity vector.',
        owner: 'Telemetry Processing Worker',
        evidence: 'ETA updated from 13:09 to 13:31 in Redis state',
      },
      {
        tick: 4,
        title: 'Automated SMS Alert to Clinic',
        detail:
          'Automated SMS dispatched to receiving nurse explaining delay and updated ETA.',
        owner: 'SMS Notification Gateway',
        evidence:
          'SMS payload: "Courier delayed by weather; ETA adjusted to 28 min"',
      },
      {
        tick: 5,
        title: 'Safe Arrival & Escalation Closed',
        detail:
          'Courier arrives safely at receiving clinic without temperature excursion.',
        owner: 'Receiver & Courier',
        evidence: 'Inspection passed; delay anomaly resolved and closed',
      },
    ],
  },
  {
    id: 'refusal-at-receipt-tamper-seal',
    chipLabel: 'S6: Broken Seal',
    name: 'Scenario 6: Broken Tamper Seal & Refusal at Receipt',
    goal: 'Enforce strict security protocol: reject crate with broken seal #7842, log incident, and quarantine cargo.',
    expectedOutcome: 'refused_tamper_seal_broken',
    defaultTick: 4,
    steps: [
      {
        tick: 1,
        title: 'Emergency Stock Dispatched & Sealed',
        detail:
          'Crate sealed with numbered plastic tamper seal #7842 at Idera PHC.',
        owner: 'Source Custodian',
        evidence: 'Seal #7842 recorded on outbound manifest',
      },
      {
        tick: 2,
        title: 'Courier Transits Corridor',
        detail:
          'Rider carries insulated carrier box across the Ado-Odo corridor.',
        owner: 'Courier',
        evidence: 'Corridor waypoint scans recorded',
      },
      {
        tick: 3,
        title: 'Courier Arrives at Receiving Gate',
        detail:
          'Courier presents crate to receiving nurse at Aiyetoro Central.',
        owner: 'Courier & Receiver',
        evidence: 'Arrival geofence triggered at receiving clinic',
      },
      {
        tick: 4,
        title: 'Broken Seal Discovered on Inspection',
        detail:
          'Receiving nurse identifies broken tamper seal #7842 with severed plastic loop.',
        owner: 'Receiver (Nurse Fatima)',
        evidence: 'Inspection photo uploaded showing severed seal #7842',
      },
      {
        tick: 5,
        title: 'Custody Refused & Incident Escalated',
        detail:
          'Receipt refused; custody NOT transferred; incident logged for LGA Pharmacist investigation.',
        owner: 'Receiver & LGA Pharmacist',
        evidence: 'Incident report #INC-991 escalated; stock quarantined',
      },
    ],
  },
  {
    id: 'demand-shock-lga-buffer',
    chipLabel: 'S7: Demand Shock',
    name: 'Scenario 7: Demand Shock & LGA Buffer Escalation',
    goal: 'Simulate sudden cluster stockouts triggering supervisor authorization of central warehouse reserve stock.',
    expectedOutcome: 'escalated_lga_buffer_release',
    defaultTick: 3,
    steps: [
      {
        tick: 1,
        title: 'Gastroenteritis Surge in Ward 2',
        detail:
          'Three clinics simultaneously request 40 ORS sachets each due to local water contamination surge.',
        owner: 'Clinics in Ward 2',
        evidence: '3 cluster requests received within 15 minutes',
      },
      {
        tick: 2,
        title: 'Peer Balancing Exhausted',
        detail:
          'Peer clinic transfer capacity insufficient to satisfy demand without breaching safety floors.',
        owner: 'System Demand Balancing Engine',
        evidence: 'Corridor surplus (35 units) < Aggregate demand (120 units)',
      },
      {
        tick: 3,
        title: 'Cluster Escalated to LGA Command',
        detail:
          'System automatically flags demand shock cluster on LGA Dashboard with high-priority alert.',
        owner: 'System Monitoring Engine',
        evidence: 'Cluster alert #CLU-402 raised to LGA Supervisor',
      },
      {
        tick: 4,
        title: 'LGA Supervisor Releases Buffer',
        detail:
          'Supervisor authorizes emergency release of 200 ORS sachets from Ota Central Medical Store buffer.',
        owner: 'LGA Health Supervisor',
        evidence: 'Supervisor release approval #SUP-771 with digital signature',
      },
      {
        tick: 5,
        title: 'Central Buffer Deployed & Contained',
        detail:
          'Buffer batch dispatched with express vehicle to Ward 2 clinics; stockouts averted.',
        owner: 'Central Store Logistics Team',
        evidence: 'Central buffer dispatch #CMS-092 confirmed delivered',
      },
    ],
  },
];

export function ScenarioLabRunner({
  colors,
  isDark,
  uiScale,
}: ScenarioLabRunnerProps) {
  const [selectedId, setSelectedId] = useState<ScenarioId>(
    'authorised-ambient-transfer',
  );
  const [currentTick, setCurrentTick] = useState<number>(4);

  const scenario = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];
  const maxTicks = scenario.steps.length;
  const clampedTick = Math.min(Math.max(1, currentTick), maxTicks);
  const step = scenario.steps[clampedTick - 1] ?? scenario.steps[0];

  const handleSelectScenario = (id: ScenarioId) => {
    setSelectedId(id);
    const target = SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
    setCurrentTick(target.defaultTick);
  };

  const handleNextTick = () => {
    setCurrentTick((prev) => (prev >= maxTicks ? 1 : prev + 1));
  };

  const handleReplay = () => {
    setCurrentTick(1);
  };

  const handleReset = () => {
    setCurrentTick(scenario.defaultTick);
  };

  const s = (val: number) => Math.round(val * uiScale);

  return (
    <View style={styles.container}>
      {/* Horizontal Scenario Selector Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {SCENARIOS.map((sc) => {
          const isSelected = sc.id === selectedId;
          return (
            <Press
              key={sc.id}
              onPress={() => handleSelectScenario(sc.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? colors.lime
                      : colors.cobalt
                    : colors.surface,
                  borderColor: isSelected
                    ? isDark
                      ? colors.lime
                      : colors.cobalt
                    : colors.line,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected
                      ? isDark
                        ? colors.limeInk
                        : '#ffffff'
                      : colors.ink,
                    fontSize: s(12),
                  },
                ]}
              >
                {sc.chipLabel}
              </Text>
            </Press>
          );
        })}
      </ScrollView>

      {/* Scenario Header Info */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.cobaltSoft,
            borderColor: colors.cobalt,
          },
        ]}
      >
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.miniBadge,
              { backgroundColor: isDark ? colors.lime : colors.cobalt },
            ]}
          >
            <Text
              style={[
                styles.miniBadgeTxt,
                { color: isDark ? colors.limeInk : '#ffffff' },
              ]}
            >
              DEMO DATA · FICTIONAL SCENARIO
            </Text>
          </View>
          <Text
            style={[
              styles.outcomeBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.06)',
                color: colors.ink,
              },
            ]}
          >
            {scenario.expectedOutcome}
          </Text>
        </View>

        <Text
          style={[styles.scenarioTitle, { color: colors.ink, fontSize: s(15) }]}
        >
          {scenario.name}
        </Text>
        <Text
          style={[styles.goalText, { color: colors.mute, fontSize: s(12) }]}
        >
          {scenario.goal}
        </Text>
      </View>

      {/* Contextual Specialty Cards for Scenarios 2, 6, 7 */}
      {scenario.id === 'source-safety-floor-breach' && (
        <View
          style={[
            styles.specialtyBox,
            {
              backgroundColor: isDark
                ? 'rgba(255,199,0,0.12)'
                : colors.cobaltSoft,
              borderColor: isDark ? colors.lime : colors.cobalt,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ShieldIcon color={isDark ? colors.lime : colors.cobalt} />
            <Text
              style={[
                styles.specialtyTitle,
                { color: isDark ? colors.lime : colors.cobalt },
              ]}
            >
              Safety Floor Protection Boundary
            </Text>
          </View>
          <Text
            style={[
              styles.specialtyBody,
              { color: colors.ink, fontSize: s(12) },
            ]}
          >
            • On-hand: <Text style={{ fontWeight: '700' }}>50 units</Text> |
            Floor: <Text style={{ fontWeight: '700' }}>30 units</Text>
            {'\n'}• Capped surplus:{' '}
            <Text style={{ fontWeight: '700' }}>20 units</Text> released{'\n'}•
            Remainder deficit:{' '}
            <Text style={{ fontWeight: '700' }}>40 units</Text> escalated to LGA
            Central Store
          </Text>
        </View>
      )}

      {scenario.id === 'refusal-at-receipt-tamper-seal' && clampedTick >= 4 && (
        <View
          style={[
            styles.specialtyBox,
            {
              backgroundColor: isDark
                ? 'rgba(244,67,54,0.18)'
                : 'rgba(211,47,47,0.08)',
              borderColor: '#d32f2f',
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <LockIcon color="#d32f2f" />
            <Text style={[styles.specialtyTitle, { color: '#d32f2f' }]}>
              Tamper Seal Severed — Receipt Refused
            </Text>
          </View>
          <Text
            style={[
              styles.specialtyBody,
              { color: colors.ink, fontSize: s(12) },
            ]}
          >
            Tamper seal #7842 was severed prior to receiving inspection. Nurse
            Fatima has refused custody. Cargo quarantined and escalated to LGA
            Pharmacist.
          </Text>
        </View>
      )}

      {scenario.id === 'demand-shock-lga-buffer' && clampedTick >= 3 && (
        <View
          style={[
            styles.specialtyBox,
            {
              backgroundColor: isDark
                ? 'rgba(255,152,0,0.18)'
                : 'rgba(255,152,0,0.08)',
              borderColor: '#ff9800',
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <FlagIcon color="#ff9800" />
            <Text style={[styles.specialtyTitle, { color: '#ff9800' }]}>
              Ward 2 Cluster Stockout — LGA Buffer Released
            </Text>
          </View>
          <Text
            style={[
              styles.specialtyBody,
              { color: colors.ink, fontSize: s(12) },
            ]}
          >
            3 clinics faced sudden pediatric gastroenteritis outbreak. LGA
            Supervisor released 200 sachets from Ota Central Medical Store.
          </Text>
        </View>
      )}

      {/* Step Event Card */}
      <View
        style={[
          styles.stepCard,
          { backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      >
        <View style={styles.stepHeader}>
          <Text
            style={[
              styles.stepCounter,
              { color: colors.cobalt, fontSize: s(12) },
            ]}
          >
            STEP {clampedTick} OF {maxTicks}
          </Text>
          <Text
            style={[styles.ownerTag, { color: colors.mute, fontSize: s(11) }]}
          >
            {step.owner}
          </Text>
        </View>
        <Text
          style={[styles.stepTitle, { color: colors.ink, fontSize: s(14) }]}
        >
          {step.title}
        </Text>
        <Text
          style={[styles.stepDetail, { color: colors.ink, fontSize: s(12.5) }]}
        >
          {step.detail}
        </Text>
        <View
          style={[
            styles.evidenceBox,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
            },
          ]}
        >
          <Text style={[styles.evidenceLabel, { color: colors.mute }]}>
            AUDITABLE EVIDENCE:
          </Text>
          <Text style={[styles.evidenceText, { color: colors.ink }]}>
            {step.evidence}
          </Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonRow}>
        <Press
          onPress={handleNextTick}
          style={[
            styles.actionBtn,
            {
              backgroundColor: isDark ? colors.lime : colors.cobalt,
              flex: 1.5,
            },
          ]}
        >
          <Text
            style={[
              styles.actionBtnTxt,
              {
                color: isDark ? colors.limeInk : '#ffffff',
                fontSize: s(13),
              },
            ]}
          >
            Next Event Tick ({clampedTick}/{maxTicks})
          </Text>
        </Press>
        <Press
          onPress={handleReplay}
          style={[
            styles.actionBtn,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
              flex: 1,
            },
          ]}
        >
          <Text
            style={[
              styles.actionBtnTxt,
              { color: colors.ink, fontSize: s(13) },
            ]}
          >
            Replay
          </Text>
        </Press>
        <Press
          onPress={handleReset}
          style={[
            styles.actionBtn,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
              flex: 1,
            },
          ]}
        >
          <Text
            style={[
              styles.actionBtnTxt,
              { color: colors.ink, fontSize: s(13) },
            ]}
          >
            Reset
          </Text>
        </Press>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '700',
  },
  headerCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  miniBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  miniBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  outcomeBadge: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  scenarioTitle: {
    fontWeight: '800',
  },
  goalText: {
    lineHeight: 16,
  },
  specialtyBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  specialtyTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  specialtyBody: {
    lineHeight: 17,
  },
  stepCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCounter: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ownerTag: {
    fontWeight: '600',
  },
  stepTitle: {
    fontWeight: '800',
  },
  stepDetail: {
    lineHeight: 18,
  },
  evidenceBox: {
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  evidenceLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  evidenceText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  actionBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTxt: {
    fontWeight: '700',
  },
});
