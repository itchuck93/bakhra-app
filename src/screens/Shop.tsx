import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Category, PRODUCTS } from '../data';
import { CATEGORY_LABEL } from '../i18n';
import { useApp } from '../store';
import { C, ProductCard, useDir } from '../ui';

export function Shop({ cat: initial }: { cat: Category | 'all' }) {
  const { t, lang } = useApp();
  const { row } = useDir();
  const { width } = useWindowDimensions();
  const [cat, setCat] = useState(initial);
  const cardW = (width - 16 * 2 - 12) / 2;

  const cats: { key: Category | 'all'; label: string }[] = [
    { key: 'all', label: t.shopAll },
    { key: 'perfume', label: CATEGORY_LABEL[lang].perfume },
    { key: 'spray', label: CATEGORY_LABEL[lang].spray },
    { key: 'roll', label: CATEGORY_LABEL[lang].roll },
    { key: 'bundle', label: t.bundles },
  ];
  const items = PRODUCTS.filter((p) => cat === 'all' || p.category === cat);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[row, s.chips]}>
        {cats.map((c) => (
          <Pressable key={c.key} style={[s.chip, cat === c.key && s.chipOn]} onPress={() => setCat(c.key)}>
            <Text style={[s.chipText, cat === c.key && { color: '#fff' }]}>{c.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={[row, s.grid]}>
        {items.map((p) => (
          <ProductCard key={p.id} p={p} width={cardW} />
        ))}
      </View>
    </ScrollView>
  );
}

export function Search() {
  const { t, lang } = useApp();
  const { row, text } = useDir();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const cardW = (width - 16 * 2 - 12) / 2;

  // Ignore case and accents so "creme" finds CRÈME.
  const norm = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const needle = norm(q.trim());
  const items = needle
    ? PRODUCTS.filter((p) => norm(`${p.name} ${CATEGORY_LABEL.en[p.category]} ${CATEGORY_LABEL.ar[p.category]}`).includes(needle))
    : PRODUCTS;

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t.searchHint}
        placeholderTextColor={C.muted}
        autoCorrect={false}
        returnKeyType="search"
        style={[s.input, text]}
      />
      {items.length === 0 ? (
        <Text style={s.empty}>{t.noResults}</Text>
      ) : (
        <View style={[row, s.grid]}>
          {items.map((p) => (
            <ProductCard key={`${lang}-${p.id}`} p={p} width={cardW} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  chips: { paddingHorizontal: 16, gap: 8, paddingVertical: 16 },
  chip: { borderWidth: 1, borderColor: C.ink, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20 },
  chipOn: { backgroundColor: C.ink },
  chipText: { fontSize: 13, color: C.ink },
  grid: { flexWrap: 'wrap', paddingHorizontal: 16, columnGap: 12, rowGap: 22 },
  input: { margin: 16, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink, borderRadius: 2 },
  empty: { textAlign: 'center', color: C.muted, marginTop: 40, fontSize: 15 },
});
