import React, { useEffect, useRef, useState } from 'react';
import { Image, Linking, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Category, EMAIL, INSTAGRAM, LOGO, PRODUCTS, SLIDES, WHATSAPP } from '../data';
import { CATEGORY_LABEL } from '../i18n';
import { useApp } from '../store';
import { C, ProductCard, useDir } from '../ui';

function Carousel() {
  const { width } = useWindowDimensions();
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % SLIDES.length;
        ref.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [playing, width]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <View>
      <ScrollView ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onEnd} onScrollBeginDrag={() => setPlaying(false)}>
        {SLIDES.map((uri) => (
          <Image key={uri} source={{ uri }} style={{ width, height: width * 1.1, backgroundColor: '#EFE9E0' }} resizeMode="cover" />
        ))}
      </ScrollView>
      <View style={s.dots}>
        {SLIDES.map((uri, i) => (
          <View key={uri} style={[s.dot, i === index && s.dotOn]} />
        ))}
        <Pressable hitSlop={10} onPress={() => setPlaying((p) => !p)} accessibilityLabel={playing ? 'Pause slideshow' : 'Play slideshow'}>
          <Text style={s.play}>{playing ? '❚❚' : '▶'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function Home() {
  const { t, lang, push } = useApp();
  const { row, text } = useDir();
  const { width } = useWindowDimensions();
  const cardW = (width - 16 * 2 - 12) / 2;

  const cats: { key: Category | 'all'; label: string }[] = [
    { key: 'all', label: t.shopAll },
    { key: 'perfume', label: CATEGORY_LABEL[lang].perfume },
    { key: 'spray', label: CATEGORY_LABEL[lang].spray },
    { key: 'roll', label: CATEGORY_LABEL[lang].roll },
    { key: 'bundle', label: t.bundles },
  ];
  const items = PRODUCTS.filter((p) => p.category !== 'bundle');
  const bundles = PRODUCTS.filter((p) => p.category === 'bundle');

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <Carousel />
      <Text style={[s.h1, text]}>{t.discover}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[row, s.chips]}>
        {cats.map((c) => (
          <Pressable key={c.key} style={s.chip} onPress={() => push({ name: 'shop', cat: c.key })}>
            <Text style={s.chipText}>{c.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[row, s.grid]}>
        {items.map((p) => (
          <ProductCard key={p.id} p={p} width={cardW} />
        ))}
      </View>

      <Text style={[s.h2, text]}>{t.bundles}</Text>
      <View style={[row, s.grid]}>
        {bundles.map((p) => (
          <ProductCard key={p.id} p={p} width={cardW} />
        ))}
      </View>

      <View style={s.footer}>
        <Image source={{ uri: LOGO }} style={s.footLogo} resizeMode="contain" />
        <Text style={s.tagline}>{t.tagline}</Text>
        <Text style={s.contact}>{t.contact}</Text>
        <View style={[row, { gap: 20 }]}>
          <Text style={s.link} onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP}`)}>{t.whatsapp}</Text>
          <Text style={s.link} onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>{t.email}</Text>
          <Text style={s.link} onPress={() => Linking.openURL(`https://instagram.com/${INSTAGRAM}`)}>{t.instagram}</Text>
        </View>
        <Text style={s.copy}>© 2026 BAKHRA</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.line },
  dotOn: { backgroundColor: C.ink, width: 18 },
  play: { fontSize: 10, color: C.muted, marginLeft: 8 },
  h1: { fontSize: 24, fontWeight: '300', letterSpacing: 0.5, color: C.ink, paddingHorizontal: 16, marginTop: 4 },
  h2: { fontSize: 20, fontWeight: '300', color: C.ink, paddingHorizontal: 16, marginTop: 32, marginBottom: 14 },
  chips: { paddingHorizontal: 16, gap: 8, paddingVertical: 16 },
  chip: { borderWidth: 1, borderColor: C.ink, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20 },
  chipText: { fontSize: 13, color: C.ink },
  grid: { flexWrap: 'wrap', paddingHorizontal: 16, columnGap: 12, rowGap: 22 },
  footer: { alignItems: 'center', marginTop: 44, paddingTop: 28, borderTopWidth: 1, borderTopColor: C.line, marginHorizontal: 16, gap: 10 },
  footLogo: { width: 140, height: 44 },
  tagline: { fontSize: 13, color: C.muted, fontStyle: 'italic' },
  contact: { fontSize: 12, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 10 },
  link: { fontSize: 14, color: C.ink, textDecorationLine: 'underline', paddingVertical: 6 },
  copy: { fontSize: 11, color: C.muted, marginTop: 8 },
});
