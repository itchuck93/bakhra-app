import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { BackHandler, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LOGO } from './src/data';
import { Cart, Checkout, Done } from './src/screens/Cart';
import Home from './src/screens/Home';
import ProductScreen from './src/screens/ProductScreen';
import { Search, Shop } from './src/screens/Shop';
import { AppProvider, Route, useApp } from './src/store';
import { C, useDir } from './src/ui';

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <Home />;
    case 'shop':
      return <Shop cat={route.cat} />;
    case 'product':
      return <ProductScreen key={route.id} id={route.id} />;
    case 'search':
      return <Search />;
    case 'cart':
      return <Cart />;
    case 'checkout':
      return <Checkout />;
    case 'done':
      return <Done orderRef={route.ref} />;
  }
}

function Shell() {
  const { t, rtl, route, canGoBack, back, reset, toggleLang, count, catalog, reloadCatalog } = useApp();
  const { row } = useDir();

  // Android hardware back button steps back through the app before exiting.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) return false;
      back();
      return true;
    });
    return () => sub.remove();
  }, [canGoBack, back]);

  const tabs: { name: 'home' | 'shop' | 'search' | 'cart'; label: string; go: Route }[] = [
    { name: 'home', label: t.home, go: { name: 'home' } },
    { name: 'shop', label: t.shop, go: { name: 'shop', cat: 'all' } },
    { name: 'search', label: t.search, go: { name: 'search' } },
    { name: 'cart', label: t.cart, go: { name: 'cart' } },
  ];
  const showTabs = route.name !== 'checkout';

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={s.announce}>
        <Text style={s.announceText}>{t.announce}</Text>
      </View>

      <View style={[row, s.header]}>
        <View style={[s.side, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
          {canGoBack && (
            <Pressable hitSlop={12} onPress={back} accessibilityLabel="Back">
              <Text style={s.back}>{rtl ? '→' : '←'}</Text>
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => reset({ name: 'home' })} accessibilityLabel="BAKHRA home">
          <Image source={{ uri: LOGO }} style={s.logo} resizeMode="contain" />
        </Pressable>
        <View style={[s.side, { alignItems: rtl ? 'flex-start' : 'flex-end' }]}>
          <Pressable hitSlop={12} onPress={toggleLang}>
            <Text style={s.lang}>{t.switchLang}</Text>
          </Pressable>
        </View>
      </View>

      {catalog === 'loading' && <Text style={s.notice}>{t.loadingStore}</Text>}
      {catalog === 'error' && (
        <Pressable onPress={reloadCatalog}>
          <Text style={[s.notice, s.noticeError]}>{t.storeError}</Text>
        </Pressable>
      )}

      <View style={{ flex: 1 }}>
        <Screen route={route} />
      </View>

      {showTabs && (
        <View style={[row, s.tabs]}>
          {tabs.map((tab) => {
            const on = route.name === tab.name;
            return (
              <Pressable key={tab.name} style={s.tab} onPress={() => reset(tab.go)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[s.tabText, on && s.tabOn]}>
                  {tab.label}
                  {tab.name === 'cart' && count > 0 ? ` (${count})` : ''}
                </Text>
                <View style={[s.tabLine, on && { backgroundColor: C.ink }]} />
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  announce: { backgroundColor: C.ink, paddingVertical: 7, alignItems: 'center' },
  announceText: { color: '#fff', fontSize: 12, letterSpacing: 0.3 },
  header: { alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: C.line },
  side: { width: 80 },
  back: { fontSize: 24, color: C.ink },
  logo: { width: 120, height: 36 },
  lang: { fontSize: 14, color: C.ink },
  tabs: { borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
  tab: { flex: 1, alignItems: 'center', paddingTop: 12, paddingBottom: 8, gap: 6 },
  tabText: { fontSize: 13, color: C.muted },
  tabOn: { color: C.ink, fontWeight: '600' },
  notice: { textAlign: 'center', paddingVertical: 8, fontSize: 13, color: C.muted, backgroundColor: C.card },
  noticeError: { color: C.sale },
  tabLine: { height: 2, width: 22, backgroundColor: 'transparent' },
});
