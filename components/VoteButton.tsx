import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { comicTheme } from '../styles/comicTheme';

interface VoteButtonProps {
  text: string;
  votes: number;
  percentage: number;
  onPress: () => void;
  isVoted: boolean;
  variant: 'A' | 'B';
  disabled?: boolean;
  style?: ViewStyle;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  text,
  votes,
  percentage,
  onPress,
  isVoted,
  variant,
  disabled = false,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(isVoted ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isVoted ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [isVoted]);

  const backgroundColor = variant === 'A' ? comicTheme.colors.primary : comicTheme.colors.accent;
  const actionColor = variant === 'A' ? comicTheme.colors.comic.boom : comicTheme.colors.comic.zap;

  return (
    <TouchableOpacity
      style={[
        styles.voteButton,
        { backgroundColor },
        isVoted && [styles.votedButton, { backgroundColor: actionColor }],
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', `${percentage}%`],
            }),
          },
        ]}
      />
      
      <Text style={[styles.choiceLabel, isVoted && styles.votedChoiceLabel]}>
        選択肢 {variant}
      </Text>
      
      <Text style={[styles.choiceText, isVoted && styles.votedChoiceText]}>
        {text}
      </Text>
      
      <Text style={[styles.voteStats, isVoted && styles.votedVoteStats]}>
        {votes}票 ({percentage}%)
      </Text>
      
      {isVoted && (
        <Text style={styles.votedBadge}>
          {variant === 'A' ? 'BOOM!' : 'ZAP!'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  voteButton: {
    borderRadius: comicTheme.borderRadius.lg,
    borderWidth: 4,
    borderColor: comicTheme.colors.dark,
    padding: comicTheme.spacing.lg,
    marginVertical: comicTheme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
    ...comicTheme.shadows.medium,
    minHeight: 120,
    justifyContent: 'center',
  },
  
  votedButton: {
    borderWidth: 5,
    borderColor: comicTheme.colors.comic.highlight,
    ...comicTheme.shadows.comic,
  },
  
  disabledButton: {
    backgroundColor: comicTheme.colors.comic.halftone,
    opacity: 0.6,
  },
  
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  
  choiceLabel: {
    fontSize: comicTheme.typography.fontSize.sm,
    fontWeight: comicTheme.typography.fontWeight.bold as any,
    color: comicTheme.colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: comicTheme.spacing.xs,
    textShadowColor: comicTheme.colors.comic.shadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  votedChoiceLabel: {
    color: comicTheme.colors.text.inverse,
    fontSize: comicTheme.typography.fontSize.md,
  },
  
  choiceText: {
    fontSize: comicTheme.typography.fontSize.lg,
    fontWeight: comicTheme.typography.fontWeight.medium as any,
    color: comicTheme.colors.text.inverse,
    marginBottom: comicTheme.spacing.sm,
    textShadowColor: comicTheme.colors.comic.shadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  votedChoiceText: {
    fontSize: comicTheme.typography.fontSize.xl,
    fontWeight: comicTheme.typography.fontWeight.bold as any,
  },
  
  voteStats: {
    fontSize: comicTheme.typography.fontSize.md,
    fontWeight: comicTheme.typography.fontWeight.bold as any,
    color: comicTheme.colors.text.inverse,
    textAlign: 'right',
    textShadowColor: comicTheme.colors.comic.shadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  votedVoteStats: {
    fontSize: comicTheme.typography.fontSize.lg,
  },
  
  votedBadge: {
    position: 'absolute',
    top: comicTheme.spacing.sm,
    right: comicTheme.spacing.sm,
    fontSize: comicTheme.typography.fontSize.lg,
    fontWeight: comicTheme.typography.fontWeight.black as any,
    color: comicTheme.colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: comicTheme.colors.comic.shadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: comicTheme.spacing.sm,
    paddingVertical: comicTheme.spacing.xs,
    borderRadius: comicTheme.borderRadius.sm,
  },
});