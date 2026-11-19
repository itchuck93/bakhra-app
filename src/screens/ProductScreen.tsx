import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { byId, PRODUCTS, scentsFor } from '../data';
import { CATEGORY_LABEL, money } from '../i18n';
import { useApp } from '../store';
import { Button, C, Price, ProductCard, Stepper, useDir } from '../ui';

export default function ProductScreen({ id }: { id: string }) {
  const { t, lang, add } = useApp();
  const { row, text } = useDir();
  const { width } = useWindowDimensions();
  const p = byId(id);
  const slots = p?.slots ?? [];

  const firstAvailable = (i: number) => scentsFor(slots[i]).find((x) => !x.soldOut)?.id ?? '';
  const [qty, setQty] = useState(1);
  const [picks, setPicks] = useState<string[]>(() => slots.map((_, i) => firstAvailable(i)));
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [added]);

  if (!p) return null;

  const sub = p.category === 'bundle' ? CATEGORY_LABEL[lang].bundle : `${CATEGORY_LABEL[lang][p.category]} · ${p.size}`;
  const related = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
  const cardW = (width - 16 * 2 - 12) / 2;

  const onAdd = () => {
    add(p.id, qty, slots.length ? picks : undefined);
    setAdded(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Image source={{ uri: p.image }} style={{ width, height: width * 1.15, backgroundColor: '#EFE9E0' }} resizeMode="cover" />
        <View style={s.body}>
          <Text style={[s.name, text]}>{p.name}</Text>
          <Text style={[s.sub, text]}>{sub}</Text>
          <Price p={p} big />
          {!!p.compareAt && (
            <Text style={[s.save, text]}>
              {t.save} {money(p.compareAt - p.price, lang)}
            </Text>
          )}

          {slots.length > 0 && (
            <View style={{ marginTop: 22 }}>
              <Text style={[s.label, text]}>{t.chooseScents}</Text>
              {slots.map((group, i) => (
                <View key={i} style={{ marginTop: 12 }}>
                  <Text style={[s.slotLabel, text]}>
                    {t.scent} {i + 1} · {CATEGORY_LABEL[lang][group]}
                  </Text>
                  <View style={[row, s.options]}>
                    {scentsFor(group).map((opt) => {
                      const on = picks[i] === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          disabled={opt.soldOut}
                          onPress={() => setPicks((prev) => prev.map((v, j) => (j === i ? opt.id : v)))}
                          style={[s.opt, on && s.optOn, opt.soldOut && s.optOff]}
                        >
                          <Text style={[s.optText, on && { color: '#fff' }, opt.soldOut && s.optTextOff]}>{opt.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

          {!p.soldOut && (
            <View style={{ marginTop: 22 }}>
              <Text style={[s.label, text, { marginBottom: 8 }]}>{t.quantity}</Text>
              <View style={row}>
                <Stepper value={qty} onChange={setQty} />
              </View>
            </View>
          )}

          <Text style={[s.note, text]}>{t.announce}</Text>
        </View>

        {related.length > 0 && (
          <>
            <Text style={[s.h2, text]}>{t.alsoLike}</Text>
            <View style={[row, s.grid]}>
              {related.map((x) => (
                <ProductCard key={x.id} p={x} width={cardW} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={s.bar}>
        <Button label={p.soldOut ? t.soldOut : added ? `✓ ${t.added}` : t.addToCart} disabled={p.soldOut} onPress={onAdd} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  body: { padding: 16 },
  name: { fontSize: 26, fontWeight: '300', letterSpacing: 2, color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 10 },
  save: { fontSize: 13, color: C.sale, marginTop: 4 },
  label: { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: C.muted },
  slotLabel: { fontSize: 13, color: C.ink, marginBottom: 8 },
  options: { flexWrap: 'wrap', gap: 8 },
  opt: { borderWidth: 1, borderColor: C.ink, paddingHorizontal: 14, paddingVertical: 10, minWidth: 64, alignItems: 'center', borderRadius: 2 },
  optOn: { backgroundColor: C.ink },
  optOff: { borderColor: C.line },
  optText: { fontSize: 13, color: C.ink, letterSpacing: 0.5 },
  optTextOff: { color: '#B9B2A9', textDecorationLine: 'line-through' },
  note: { fontSize: 12, color: C.muted, marginTop: 22 },
  h2: { fontSize: 20, fontWeight: '300', color: C.ink, paddingHorizontal: 16, marginTop: 20, marginBottom: 14 },
  grid: { flexWrap: 'wrap', paddingHorizontal: 16, columnGap: 12, rowGap: 22 },
  bar: { padding: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
});
