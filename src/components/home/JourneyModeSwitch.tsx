import { Pressable, StyleSheet, View } from 'react-native';

import { palette, radius, space } from '../../../design-tokens';
import { Text } from '../ui';

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
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.button,
        selected && styles.buttonSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        role="sm"
        weight="semibold"
        color={selected ? palette.hanji : palette.ash}
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
    backgroundColor: palette.cloud,
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  button: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  buttonSelected: { backgroundColor: palette.meok },
  pressed: { opacity: 0.72 },
});
