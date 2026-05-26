import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { ActivityIndicator } from "react-native";

type LoadingButtonProps = {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  spinnerColor: string;
  style?: StyleProp<ViewStyle>;
};

export function LoadingButton({
  title,
  loading = false,
  disabled = false,
  onPress,
  backgroundColor,
  textColor,
  spinnerColor,
  style,
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? <ActivityIndicator color={spinnerColor} /> : <Text style={[styles.title, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  disabled: {
    opacity: 0.72,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
});