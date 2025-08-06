import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Article } from '../types';
import { COLORS } from '../constants/colors';
import { formatNumber, formatPercentage } from '../utils/formatters';

interface VotingCardProps {
  article: Article;
  hasVoted: boolean;
  voting: boolean;
  onVote: (choice: 'a' | 'b') => void;
}

export const VotingCard: React.FC<VotingCardProps> = ({
  article,
  hasVoted,
  voting,
  onVote,
}) => {
  const totalVotes = article.choice_a_votes + article.choice_b_votes;

  return (
    <Card style={styles.votingCard}>
      <Card.Content>
        <Text style={styles.votingTitle}>
          投票してください
        </Text>
        
        <View style={styles.choicesContainer}>
          <TouchableOpacity
            style={[
              styles.choiceButton,
              hasVoted && article.user_vote === 'a' && styles.choiceButtonVoted,
              (hasVoted || voting) && styles.choiceButtonDisabled
            ]}
            onPress={() => onVote('a')}
            disabled={hasVoted || voting}
          >
            <Text style={styles.choiceText}>{article.choice_a_text}</Text>
            <View style={styles.voteInfo}>
              <Text style={styles.voteCount}>
                {formatNumber(article.choice_a_votes)}票
              </Text>
              <Text style={styles.percentage}>
                {formatPercentage(article.choice_a_odds)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceButton,
              hasVoted && article.user_vote === 'b' && styles.choiceButtonVoted,
              (hasVoted || voting) && styles.choiceButtonDisabled
            ]}
            onPress={() => onVote('b')}
            disabled={hasVoted || voting}
          >
            <Text style={styles.choiceText}>{article.choice_b_text}</Text>
            <View style={styles.voteInfo}>
              <Text style={styles.voteCount}>
                {formatNumber(article.choice_b_votes)}票
              </Text>
              <Text style={styles.percentage}>
                {formatPercentage(article.choice_b_odds)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.totalVotes}>
          総投票数: {formatNumber(totalVotes)}票
        </Text>

        {hasVoted && (
          <View style={styles.thankYouContainer}>
            <Text style={styles.thankYouText}>
              投票ありがとうございました！
            </Text>
            <Text style={styles.pointText}>
              +1ポイント獲得
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  votingCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  votingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: COLORS.VOTE_CARD,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
    padding: 16,
  },
  choiceButtonVoted: {
    backgroundColor: COLORS.SUCCESS_LIGHT,
    borderColor: COLORS.SUCCESS,
  },
  choiceButtonDisabled: {
    opacity: 0.6,
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  voteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  totalVotes: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: 16,
  },
  thankYouContainer: {
    backgroundColor: COLORS.SUCCESS_LIGHT,
    borderRadius: 0,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 16,
    color: COLORS.POINTS_GREEN,
    fontWeight: '600',
    marginBottom: 4,
  },
  pointText: {
    fontSize: 14,
    color: COLORS.POINTS_GREEN,
    fontWeight: '500',
  },
});