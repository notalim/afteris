import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Article } from '@/types';

const categoryColorMap: Record<string, 'primary' | 'success' | 'error'> = {
  safety: 'error',
  protocols: 'primary',
  nutrition: 'success',
  recovery: 'success',
  'q&a': 'primary',
};

interface ArticleCardProps {
  article: Article;
  bookmarked: boolean;
  onPress: () => void;
  onToggleBookmark: () => void;
}

export function ArticleCard({
  article,
  bookmarked,
  onPress,
  onToggleBookmark,
}: ArticleCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={onToggleBookmark}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.bookmarkButton}
        >
          <Feather
            name={bookmarked ? 'bookmark' : 'bookmark'}
            size={18}
            color={bookmarked ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>[Image]</Text>
        </View>

        <Badge
          label={article.category.toUpperCase()}
          color={categoryColorMap[article.category] ?? 'primary'}
        />

        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>

        <Text style={styles.readTime}>{article.readTimeMinutes} min read</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: Spacing.md,
  } as ViewStyle,
  card: {
    gap: Spacing.sm,
    position: 'relative',
  } as ViewStyle,
  bookmarkButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 1,
  } as ViewStyle,
  imagePlaceholder: {
    height: 80,
    backgroundColor: '#F5F0EB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  imagePlaceholderText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textSecondary,
  } as TextStyle,
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.textPrimary,
  } as TextStyle,
  readTime: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
  } as TextStyle,
});
