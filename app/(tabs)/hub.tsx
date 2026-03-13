import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { articles } from '@/constants/articles';
import { toggleBookmark, getBookmarks } from '@/db/queries';
import { ArticleCard } from '@/components/hub/ArticleCard';
import { CategoryPill } from '@/components/hub/CategoryPill';
import { SafetyBanner } from '@/components/hub/SafetyBanner';
import { ArticleDetailModal } from '@/components/hub/ArticleDetailModal';
import type { Article, Bookmark } from '@/types';

const CATEGORIES = ['All', 'Safety', 'Protocols', 'Nutrition', 'Recovery', 'Q&A'];

export default function HubScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<Set<string>>(new Set());
  const [detailArticle, setDetailArticle] = useState<Article | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const loadBookmarks = useCallback(async () => {
    const bm = await getBookmarks();
    setBookmarkedSlugs(new Set(bm.map((b: Bookmark) => b.article_slug)));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [loadBookmarks]),
  );

  const featuredArticle = useMemo(
    () => articles.find((a) => a.slug === 'reconstitution-101') ?? articles[0],
    [],
  );

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'All') return articles;
    const cat = selectedCategory.toLowerCase();
    return articles.filter((a) => a.category === cat);
  }, [selectedCategory]);

  const handleToggleBookmark = useCallback(
    async (slug: string) => {
      const isNowBookmarked = await toggleBookmark(slug);
      setBookmarkedSlugs((prev) => {
        const next = new Set(prev);
        if (isNowBookmarked) {
          next.add(slug);
        } else {
          next.delete(slug);
        }
        return next;
      });
    },
    [],
  );

  const openDetail = useCallback((article: Article) => {
    setDetailArticle(article);
    setDetailVisible(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>The Afteris Hub</Text>
        </View>

        {/* Featured Banner */}
        <TouchableOpacity
          onPress={() => openDetail(featuredArticle)}
          activeOpacity={0.85}
          style={styles.featuredCard}
        >
          <View style={styles.featuredImage}>
            <Text style={styles.featuredImageText}>[Featured Image]</Text>
          </View>
          <Text style={styles.featuredTitle}>
            Getting Started: Your First Injection Checklist
          </Text>
          <Text style={styles.readNow}>Read Now →</Text>
        </TouchableOpacity>

        {/* Category Pills — edge-to-edge scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillScrollContent}
        >
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>

        {/* Article Grid */}
        <View style={styles.grid}>
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              bookmarked={bookmarkedSlugs.has(article.slug)}
              onPress={() => openDetail(article)}
              onToggleBookmark={() => handleToggleBookmark(article.slug)}
            />
          ))}
        </View>

        {/* Safety Banner */}
        <SafetyBanner />

        {/* Tab bar spacer */}
        <View style={styles.tabBarSpacer} />
      </ScrollView>

      <ArticleDetailModal
        visible={detailVisible}
        article={detailArticle}
        bookmarked={detailArticle ? bookmarkedSlugs.has(detailArticle.slug) : false}
        onClose={() => setDetailVisible(false)}
        onToggleBookmark={() => {
          if (detailArticle) handleToggleBookmark(detailArticle.slug);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  } as ViewStyle,
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  } as ViewStyle,
  title: {
    ...Typography.h1,
  } as TextStyle,

  featuredCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  } as ViewStyle,
  featuredImage: {
    height: 120,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  featuredImageText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  } as TextStyle,
  featuredTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.textPrimary,
  } as TextStyle,
  readNow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.primary,
  } as TextStyle,
  pillScroll: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.xl,
  } as ViewStyle,
  pillScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  } as ViewStyle,
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  } as ViewStyle,
  tabBarSpacer: {
    height: 20,
  } as ViewStyle,
});
