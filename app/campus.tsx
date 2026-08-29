import React from 'react';
import { Linking, View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Building2,
  MapPin,
  Train,
  Utensils,
  Home as HomeIcon,
  X,
  Clock,
  Shirt,
  KeyRound,
} from 'lucide-react-native';

import { Text, EmptyState, IconButton, MIN_TARGET } from '../src/components/ui';
import { palette, space, radius } from '../design-tokens';
import { useProfile } from '../src/hooks/useProfile';
import { universityById, University } from '../src/data/universities';
import { selectMissionHousing, selectUniversityId } from '../src/lib/profileCompat';
import { evidenceNeedsReview, isEvidenceReviewDue } from '../src/lib/contentEvidence';
import { formatKstDate } from '../src/lib/dates';
import { surfaceError } from '../src/lib/errorAlert';

export default function Campus() {
  const router = useRouter();
  const { profile } = useProfile();
  const universityId = selectUniversityId(profile);
  const uni = universityId ? universityById(universityId) : null;
  const housing = selectMissionHousing(profile);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton
          icon={ChevronLeft}
          size={24}
          accessibilityLabel="Back"
          onPress={() => router.back()}
        />
        <Text role="body" weight="semibold">
          Campus guide
        </Text>
        <View style={{ width: MIN_TARGET }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {!uni ? (
          <EmptyState
            icon={<Building2 size={48} color={palette.stone} strokeWidth={1.5} />}
            message="No university selected yet."
            accessibilityLabel="No university selected. Update your profile to see campus guidance."
          />
        ) : (
          <>
            <UniversityHeader uni={uni} />
            {housing === 'dormitory' ? (
              <DormBlock uni={uni} />
            ) : housing === 'off-campus' ? (
              <OffCampusBlock uni={uni} />
            ) : null}
            <NearbyEatsBlock uni={uni} />
            <TransitBlock uni={uni} />
            <CampusEvidenceBlock uni={uni} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function UniversityHeader({ uni }: { uni: University }) {
  return (
    <View style={styles.section}>
      <Text role="xs" color={palette.ash} weight="semibold">
        University
      </Text>
      <Text role="h2" style={{ marginTop: space[1] }}>
        {uni.nameEn}
      </Text>
      <Text role="sm" color={palette.ash}>
        {uni.nameKo}
      </Text>
      <View style={styles.metaRow}>
        <MapPin size={16} color={palette.ink} strokeWidth={1.6} />
        <Text role="sm" color={palette.meok} style={{ flex: 1 }}>
          {uni.address}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Building2 size={16} color={palette.hwanggeumDeep} strokeWidth={1.6} />
        <Text role="sm" color={palette.meok}>
          {uni.campusArea}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Train size={16} color={palette.cheong} strokeWidth={1.6} />
        <Text role="sm" color={palette.meok}>
          {uni.nearestStation}
        </Text>
      </View>
    </View>
  );
}

function DormBlock({ uni }: { uni: University }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <KeyRound size={18} color={palette.hwanggeumDeep} strokeWidth={1.6} />
        <Text role="h4">Dormitory</Text>
      </View>

      <View style={styles.subBlock}>
        <Text role="xs" color={palette.ash} weight="semibold">
          Prohibited items
        </Text>
        <View style={{ gap: space[1], marginTop: space[2] }}>
          {uni.dorm.prohibited.map((item) => (
            <View key={item} style={styles.bullet}>
              <X size={14} color={palette.ink} strokeWidth={2} />
              <Text role="sm" color={palette.meok} style={{ flex: 1 }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.subBlock}>
        <Text role="xs" color={palette.ash} weight="semibold">
          Check-in
        </Text>
        <Text role="sm" color={palette.meok} style={{ marginTop: space[2] }}>
          {uni.dorm.checkin}
        </Text>
      </View>

      {uni.dorm.curfew ? (
        <View style={styles.subBlock}>
          <View style={styles.bullet}>
            <Clock size={14} color={palette.cheong} strokeWidth={1.8} />
            <Text role="xs" color={palette.ash} weight="semibold">
              Curfew
            </Text>
          </View>
          <Text role="sm" color={palette.meok} style={{ marginTop: space[2] }}>
            {uni.dorm.curfew}
          </Text>
        </View>
      ) : null}

      {uni.dorm.laundry ? (
        <View style={styles.subBlock}>
          <View style={styles.bullet}>
            <Shirt size={14} color={palette.cheong} strokeWidth={1.8} />
            <Text role="xs" color={palette.ash} weight="semibold">
              Laundry
            </Text>
          </View>
          <Text role="sm" color={palette.meok} style={{ marginTop: space[2] }}>
            {uni.dorm.laundry}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function OffCampusBlock({ uni }: { uni: University }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <HomeIcon size={18} color={palette.hwanggeumDeep} strokeWidth={1.6} />
        <Text role="h4">Off-campus areas</Text>
      </View>
      <Text role="sm" color={palette.ash}>
        Where most students rent near {uni.shortName}.
      </Text>
      <View style={{ gap: space[2], marginTop: space[3] }}>
        {uni.offCampusArea.map((area) => (
          <View key={area} style={styles.areaPill}>
            <MapPin size={14} color={palette.cheong} strokeWidth={1.8} />
            <Text role="sm" color={palette.meok}>
              {area}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function NearbyEatsBlock({ uni }: { uni: University }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Utensils size={18} color={palette.ink} strokeWidth={1.6} />
        <Text role="h4">Nearby eats</Text>
      </View>
      <View style={{ gap: space[2], marginTop: space[2] }}>
        {uni.nearbyEats.map((spot) => (
          <View key={spot} style={styles.eatRow}>
            <Text role="body" color={palette.meok}>
              {spot}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TransitBlock({ uni }: { uni: University }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Train size={18} color={palette.cheong} strokeWidth={1.6} />
        <Text role="h4">Getting to campus</Text>
      </View>
      <View style={{ gap: space[2], marginTop: space[2] }}>
        {uni.transitRoutes.map((route, idx) => (
          <View key={idx} style={styles.routeRow}>
            <View style={styles.routeDot} />
            <Text role="sm" color={palette.meok} style={{ flex: 1 }}>
              {route}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CampusEvidenceBlock({ uni }: { uni: University }) {
  const blocks: [keyof University['contentEvidence'], string][] = [
    ['address', 'Address'],
    ['dorm', 'Dormitory'],
    ['transit', 'Transit'],
    ['nearbyEats', 'Nearby eats'],
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Building2 size={18} color={palette.ash} strokeWidth={1.6} />
        <Text role="h4">Sources and freshness</Text>
      </View>
      <Text role="xs" color={palette.ash}>
        Campus details are checked separately; a source for one block does not confirm another.
      </Text>
      <View style={{ gap: space[3], marginTop: space[2] }}>
        {blocks.map(([key, label]) => {
          const evidence = uni.contentEvidence[key];
          const review = evidenceNeedsReview(evidence);
          return (
            <View key={key} style={styles.evidenceRow}>
              <Text role="xs" weight="semibold" color={palette.meok}>
                {label} · {evidence.verification === 'verified' ? 'Verified' : 'Check before relying'}
              </Text>
              <Text role="xs" color={palette.ash}>
                {evidence.note} Checked {formatKstDate(evidence.checkedAt)}.
                {review || isEvidenceReviewDue(evidence)
                  ? ` Confirm with ${evidence.finalAuthority}.`
                  : ''}
              </Text>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Open ${label} source: ${evidence.sourceTitle}`}
                onPress={() => Linking.openURL(evidence.sourceUrl).catch(() => surfaceError('unknown'))}
                style={({ pressed }) => [styles.evidenceLink, pressed ? styles.itemPressed : null]}
              >
                <Text role="xs" color={palette.cheong}>
                  {evidence.publisher} · Open source
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.hanji },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingVertical: space[4],
  },
  body: {
    paddingHorizontal: space[5],
    paddingBottom: space[12],
    gap: space[5],
  },
  section: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.hanji,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginTop: space[2],
  },
  subBlock: {
    marginTop: space[3],
    paddingTop: space[3],
    borderTopWidth: 1,
    borderTopColor: palette.hairline,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  areaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: palette.cloud,
    alignSelf: 'flex-start',
  },
  eatRow: {
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: palette.cloud,
  },
  routeRow: {
    flexDirection: 'row',
    gap: space[2],
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: palette.cheong,
    marginTop: 8,
  },
  evidenceRow: {
    gap: 2,
    paddingLeft: space[3],
    borderLeftWidth: 2,
    borderLeftColor: palette.hairline,
  },
  evidenceLink: {
    minHeight: MIN_TARGET,
    justifyContent: 'center',
  },
  itemPressed: {
    opacity: 0.72,
  },
});
