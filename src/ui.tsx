import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Product } from './data';
import { CATEGORY_LABEL, money } from './i18n';
import { useApp } from './store';

// Palette chosen for the demo (the site's exact colours could not be read) — adjust to brand.
export const C = {
  bg: '#FAF7F2',
  card: '#FFFFFF',
  ink: '#1A1714',
  muted: '#7A726A',
  line: '#E7E0D6',
  accent: '#9C7A4B',
  sale: '#A33B2B',
};

/** Row direction and text alignment that follow the selected language. */
export function useDir() {
  const { rtl } = useApp();
  return {
    row: { flexDirection: rtl ? 'row-reverse' : 'row' } as ViewStyle,
    text: { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' } as TextStyle,
  };
}

export function Button({ label, onPress, disabled, kind = 'solid' }: { label: string; onPress: () => void; disabled?: boolean; kind?: 'solid' | 'outline' }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.btn, kind === 'outline' && s.btnOutline, disabled && s.btnDisabled, pressed && { opacity: 0.8 }]}
    >
      <Text style={[s.btnText, kind === 'outline' && { color: C.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function Stepper({ value, onChange, min = 1 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <View style={s.stepper}>
      <Pressable accessibilityLabel="Decrease" hitSlop={8} style={s.stepBtn} onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={s.stepSign}>−</Text>
      </Pressable>
      <Text style={s.stepValue}>{value}</Text>
      <Pressable accessibilityLabel="Increase" hitSlop={8} style={s.stepBtn} onPress={() => onChange(value + 1)}>
        <Text style={s.stepSign}>+</Text>
      </Pressable>
    </View>
  );
}

export function Price({ p, big }: { p: Product; big?: boolean }) {
  const { lang } = useApp();
  const { row } = useDir();
  return (
    <View style={[row, { alignItems: 'baseline', gap: 8 }]}>
      <Text style={[s.price, big && { fontSize: 20 }, !!p.compareAt && { color: C.sale }]}>{money(p.price, lang)}</Text>
      {!!p.compareAt && <Text style={s.compare}>{money(p.compareAt, lang)}</Text>}
    </View>
  );
}

export function ProductCard({ p, width }: { p: Product; width: number }) {
  const { push, lang, t } = useApp();
  const { text } = useDir();
  const sub = p.category === 'bundle' ? CATEGORY_LABEL[lang].bundle : `${CATEGORY_LABEL[lang][p.category]} · ${p.size}`;
  return (
    <Pressable style={{ width }} onPress={() => push({ name: 'product', id: p.id })}>
      <View style={s.cardImgWrap}>
        <Image source={{ uri: p.image }} style={s.cardImg} resizeMode="cover" />
        {p.soldOut && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{t.soldOut}</Text>
          </View>
        )}
      </View>
      <Text style={[s.cardName, text]} numberOfLines={2}>{p.name}</Text>
      <Text style={[s.cardSub, text]}>{sub}</Text>
      <Price p={p} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { backgroundColor: C.ink, paddingVertical: 15, borderRadius: 2, alignItems: 'center' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.ink },
  btnDisabled: { backgroundColor: '#B9B2A9' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: 2, alignSelf: 'flex-start', backgroundColor: C.card },
  stepBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepSign: { fontSize: 18, color: C.ink },
  stepValue: { minWidth: 28, textAlign: 'center', fontSize: 15, color: C.ink },
  price: { fontSize: 14, color: C.ink, fontWeight: '600' },
  compare: { fontSize: 13, color: C.muted, textDecorationLine: 'line-through' },
  cardImgWrap: { aspectRatio: 0.8, backgroundColor: '#EFE9E0', overflow: 'hidden', borderRadius: 2 },
  cardImg: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: C.ink, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 11, letterSpacing: 0.5 },
  cardName: { marginTop: 10, fontSize: 15, fontWeight: '600', letterSpacing: 1, color: C.ink },
  cardSub: { fontSize: 12, color: C.muted, marginTop: 2, marginBottom: 4 },
});
