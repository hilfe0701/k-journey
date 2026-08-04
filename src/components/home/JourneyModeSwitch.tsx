import { Pressable, StyleSheet, View } from 'react-native';

import { palette, radius, space } from '../../../design-tokens';
import { MIN_TARGET, Text } from '../ui';
import { a11yState } from '../../lib/a11y';

export type JourneyMode = 'essentials' | 'culture';

export function JourneyModeSwitch({
  active,
  onChange,
}: {
  active: JourneyMode;
  onChange: (mode: JourneyMode) => void;
}) {
  return (
    <View style={styles.root} accessibilityRole="tablist">
      <ModeButton
        label="Essentials"
        selected={active === 'essentials'}
        onPress={() => onChange('essentials')}
      />
      <ModeButton
        label="Culture"
        selected={active === 'culture'}
        onPress={() => onChange('culture')}
      />
    </View>
  );
}

function ModeButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={`${label} journey view`}
      {...a11yState({ selected })}
      style={({ pressed }) => [
        styles.button,
        selected && styles.buttonSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        role="buttonSm"
        weight={selected ? 'semibold' : 'medium'}
        color={selected ? palette.canvas : palette.muted}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    padding: space[1],
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  button: {
    flex: 1,
    // 44pt exactly — measured at 42 in the browser audit, under the minimum.
    minHeight: MIN_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  buttonSelected: { backgroundColor: palette.ink },
  pressed: { opacity: 0.72 },
});
