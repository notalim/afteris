import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';
import type { Article } from '@/types';

interface ArticleDetailModalProps {
  visible: boolean;
  article: Article | null;
  bookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: () => void;
}

const categoryColorMap: Record<string, 'primary' | 'success' | 'error'> = {
  safety: 'error',
  protocols: 'primary',
  nutrition: 'success',
  recovery: 'success',
  'q&a': 'primary',
};

export function ArticleDetailModal({
  visible,
  article,
  bookmarked,
  onClose,
  onToggleBookmark,
}: ArticleDetailModalProps) {
  if (!article) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            onPress={onToggleBookmark}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather
              name="bookmark"
              size={22}
              color={bookmarked ? Colors.primary : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.meta}>
            <Badge
              label={article.category.toUpperCase()}
              color={categoryColorMap[article.category] ?? 'primary'}
            />
            <Text style={styles.readTime}>
              {article.readTimeMinutes} min read
            </Text>
          </View>

          <Text style={styles.body}>{article.body}</Text>

          <View style={styles.bottomAction}>
            <Button
              title={bookmarked ? 'Bookmarked' : 'Bookmark this article'}
              onPress={onToggleBookmark}
              variant={bookmarked ? 'primary' : 'secondary'}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
  } as ViewStyle,
  headerSpacer: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.huge,
  } as ViewStyle,
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 24,
    lineHeight: 32,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  } as TextStyle,
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  } as ViewStyle,
  readTime: {
    ...Typography.caption,
  } as TextStyle,
  body: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textPrimary,
  } as TextStyle,
  bottomAction: {
    marginTop: Spacing.xxxl,
  } as ViewStyle,
});
