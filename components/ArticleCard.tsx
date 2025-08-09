import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { Article } from '../types';
import { COLORS } from '../constants/colors';
import { formatPercentage } from '../utils/formatters';

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress }) => {

  return (
    <TouchableOpacity onPress={() => onPress(article)}>
      <Card style={styles.articleCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.thumbnailContainer}>
            {article.thumbnail_url ? (
              <Image
                source={{ uri: article.thumbnail_url }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.defaultThumbnail}>
                <Text style={styles.defaultThumbnailText}>画像なし</Text>
              </View>
            )}
          </View>

          <View style={styles.articleMainContent}>
            <View style={styles.articleHeader}>
              <Text style={styles.articleTitle} numberOfLines={2}>
                {article.title}
              </Text>
            </View>

            <View style={styles.choicesContainer}>
              <View style={styles.choice}>
                <Text style={styles.choiceText} numberOfLines={1}>
                  {article.choice_a_text}
                </Text>
                <Text style={styles.oddsText}>
                  {formatPercentage(article.choice_a_odds)}
                </Text>
              </View>
              <View style={styles.choice}>
                <Text style={styles.choiceText} numberOfLines={1}>
                  {article.choice_b_text}
                </Text>
                <Text style={styles.oddsText}>
                  {formatPercentage(article.choice_b_odds)}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  articleCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 6,
    shadowColor: COLORS.SHADOW_COMIC,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    borderWidth: 3,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    transform: [{ rotate: '-0.5deg' }],
  },
  cardContent: {
    flexDirection: 'row',
    padding: 14,
  },
  thumbnailContainer: {
    width: 140,
    height: 100,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.TEXT_PRIMARY,
    borderRadius: 0,
    shadowColor: COLORS.SHADOW_RED,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  defaultThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.COMIC_PANEL_BG,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultThumbnailText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  articleMainContent: {
    flex: 1,
  },
  articleHeader: {
    marginBottom: 10,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    lineHeight: 22,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: COLORS.COMIC_ACCENT,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  choicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.COMIC_HIGHLIGHT,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    transform: [{ skewX: '-2deg' }],
  },
  choice: {
    flex: 1,
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  oddsText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.SECONDARY,
    textShadowColor: COLORS.TEXT_PRIMARY,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});