import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { byId, FREE_DELIVERY_FROM } from '../data';
import { createCheckout } from '../shopify';
import { CATEGORY_LABEL, money } from '../i18n';
import { useApp } from '../store';
import { Button, C, Stepper, useDir } from '../ui';

function Totals() {
  const { t, lang, subtotal } = useApp();
  const { row } = useDir();
  const free = subtotal >= FREE_DELIVERY_FROM;
  return (
    <View style={s.totals}>
      <View style={[row, s.totalRow]}>
        <Text style={s.totalLabel}>{t.subtotal}</Text>
        <Text style={s.totalValue}>{money(subtotal, lang)}</Text>
      </View>
      <View style={[row, s.totalRow]}>
        <Text style={s.totalLabel}>{t.delivery}</Text>
        <Text style={s.totalLabel}>{free ? t.free : t.atCheckout}</Text>
      </View>
      {!free && <Text style={s.hint}>{t.moreForFree.replace('{x}', money(FREE_DELIVERY_FROM - subtotal, lang))}</Text>}
    </View>
  );
}

export function Cart() {
  const { t, lang, cart, setQty, push, reset, clear, catalog, reloadCatalog } = useApp();
  const { row, text } = useDir();
  const [busy, setBusy] = useState(false);

  const goToCheckout = async () => {
    // No Shopify settings yet: use the demo form.
    if (catalog === 'demo') return push({ name: 'checkout' });

    const lines = cart.map((l) => ({
      variantId: byId(l.id)?.variantId,
      quantity: l.qty,
      note: l.picks?.map((id) => byId(id)?.name).filter(Boolean).join(', '),
    }));
    if (lines.some((l) => !l.variantId)) {
      reloadCatalog();
      return Alert.alert(t.checkoutError);
    }

    setBusy(true);
    try {
      const url = await createCheckout(lines as { variantId: string; quantity: number; note?: string }[]);
      setBusy(false);
      // Opens Shopify's own checkout (payment, delivery, order emails) inside the app.
      await WebBrowser.openBrowserAsync(url);
      Alert.alert(t.finishedQ, t.finishedBody, [
        { text: t.keepCart, style: 'cancel' },
        { text: t.clearCart, onPress: clear },
      ]);
    } catch (err) {
      console.warn('Checkout failed', err);
      setBusy(false);
      Alert.alert(t.checkoutError);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>{t.emptyCart}</Text>
        <View style={{ alignSelf: 'stretch' }}>
          <Button label={t.continueShopping} kind="outline" onPress={() => reset({ name: 'shop', cat: 'all' })} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {cart.map((line) => {
          const p = byId(line.id);
          if (!p) return null;
          const picks = line.picks?.map((id) => byId(id)?.name).filter(Boolean).join(' · ');
          return (
            <View key={line.key} style={[row, s.line]}>
              <Image source={{ uri: p.image }} style={s.thumb} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[s.name, text]}>{p.name}</Text>
                <Text style={[s.sub, text]}>{picks || `${CATEGORY_LABEL[lang][p.category]}${p.size ? ` · ${p.size}` : ''}`}</Text>
                <Text style={[s.price, text]}>{money(p.price * line.qty, lang)}</Text>
                <View style={[row, { alignItems: 'center', gap: 16, marginTop: 4 }]}>
                  <Stepper value={line.qty} min={0} onChange={(n) => setQty(line.key, n)} />
                  <Text style={s.remove} onPress={() => setQty(line.key, 0)}>{t.remove}</Text>
                </View>
              </View>
            </View>
          );
        })}
        <Totals />
      </ScrollView>
      <View style={s.bar}>
        {busy ? (
          <ActivityIndicator size="large" color={C.ink} style={{ paddingVertical: 10 }} />
        ) : (
          <Button label={t.checkout} onPress={goToCheckout} />
        )}
      </View>
    </View>
  );
}

export function Checkout() {
  const { t, clear, reset } = useApp();
  const { text } = useDir();
  const [form, setForm] = useState({ name: '', phone: '', area: '', address: '' });
  const [error, setError] = useState(false);

  const fields: { key: keyof typeof form; label: string; phone?: boolean }[] = [
    { key: 'name', label: t.fullName },
    { key: 'phone', label: t.phone, phone: true },
    { key: 'area', label: t.area },
    { key: 'address', label: t.address },
  ];

  const submit = () => {
    if (Object.values(form).some((v) => !v.trim())) return setError(true);
    // Demo only: nothing leaves the device. Hook up real checkout here later.
    const ref = `DEMO-${Date.now().toString().slice(-6)}`;
    clear();
    reset({ name: 'done', ref });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16 }}>
        <Text style={[s.demo, text]}>{t.demoBanner}</Text>
        {fields.map((f) => (
          <View key={f.key} style={{ marginBottom: 14 }}>
            <Text style={[s.fieldLabel, text]}>{f.label}</Text>
            <TextInput
              value={form[f.key]}
              onChangeText={(v) => {
                setError(false);
                setForm((prev) => ({ ...prev, [f.key]: v }));
              }}
              keyboardType={f.phone ? 'phone-pad' : 'default'}
              style={[s.input, text]}
            />
          </View>
        ))}
        {error && <Text style={[s.error, text]}>{t.required}</Text>}
        <Totals />
      </ScrollView>
      <View style={s.bar}>
        <Button label={t.placeOrder} onPress={submit} />
      </View>
    </KeyboardAvoidingView>
  );
}

export function Done({ orderRef }: { orderRef: string }) {
  const { t, reset } = useApp();
  return (
    <View style={s.empty}>
      <Text style={s.thanks}>{t.thanks}</Text>
      <Text style={s.emptyText}>{t.demoDone}</Text>
      <Text style={s.ref}>
        {t.orderRef}: {orderRef}
      </Text>
      <View style={{ alignSelf: 'stretch' }}>
        <Button label={t.backHome} onPress={() => reset({ name: 'home' })} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 18 },
  emptyText: { fontSize: 16, color: C.muted, textAlign: 'center', lineHeight: 24 },
  line: { gap: 14, paddingBottom: 18, marginBottom: 18, borderBottomWidth: 1, borderBottomColor: C.line },
  thumb: { width: 88, height: 110, backgroundColor: '#EFE9E0', borderRadius: 2 },
  name: { fontSize: 15, fontWeight: '600', letterSpacing: 1, color: C.ink },
  sub: { fontSize: 12, color: C.muted },
  price: { fontSize: 14, color: C.ink },
  remove: { fontSize: 13, color: C.muted, textDecorationLine: 'underline', paddingVertical: 8 },
  totals: { marginTop: 6, gap: 10 },
  totalRow: { justifyContent: 'space-between' },
  totalLabel: { fontSize: 14, color: C.muted },
  totalValue: { fontSize: 17, fontWeight: '600', color: C.ink },
  hint: { fontSize: 12, color: C.accent },
  bar: { padding: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
  demo: { backgroundColor: '#F3E9D8', color: '#6B5230', padding: 12, fontSize: 13, lineHeight: 19, marginBottom: 18, borderRadius: 2 },
  fieldLabel: { fontSize: 12, color: C.muted, marginBottom: 6, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: C.line, backgroundColor: C.card, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink, borderRadius: 2 },
  error: { color: C.sale, fontSize: 13, marginBottom: 8 },
  thanks: { fontSize: 28, fontWeight: '300', color: C.ink, letterSpacing: 1 },
  ref: { fontSize: 13, color: C.ink, letterSpacing: 1 },
});
