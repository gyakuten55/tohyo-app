import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { Article } from '../types';
import { COLORS } from '../constants/colors';
import { formatPercentage } from '../utils/formatters';

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress }) => {
  const totalVotes = article.choice_a_votes + article.choice_b_votes;
  const hasVoted = article.user_vote !== null;

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
              <Text style={styles.vs}>vs</Text>
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
    marginVertical: 8,
    elevation: 2,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnailContainer: {
    width: 140,
    height: 100,
    marginRight: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  defaultThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultThumbnailText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
  },
  articleMainContent: {
    flex: 1,
  },
  articleHeader: {
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
  },
  choicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: COLORS.VOTE_CARD,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
  },
  choice: {
    flex: 1,
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 2,
  },
  oddsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  vs: {
    fontSize: 10,
    color: COLORS.TEXT_LIGHT,
    marginHorizontal: 4,
  },
});