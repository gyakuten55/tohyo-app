import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { COLORS } from '../constants/colors';

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

  const backgroundColor = variant === 'A' ? COLORS.PRIMARY : COLORS.SECONDARY;
  const actionColor = variant === 'A' ? COLORS.COMIC_BOOM : COLORS.COMIC_ZAP;

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
    borderRadius: 0,
    borderWidth: 4,
    borderColor: COLORS.TEXT_PRIMARY,
    padding: 16,
    marginVertical: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
    minHeight: 120,
    justifyContent: 'center',
  },
  
  votedButton: {
    borderWidth: 5,
    borderColor: COLORS.COMIC_ACCENT,
    shadowColor: COLORS.SHADOW_RED,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  
  disabledButton: {
    backgroundColor: COLORS.TEXT_LIGHT,
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
    fontSize: 14,
    fontWeight: '800' as any,
    color: COLORS.TEXT_WHITE,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  votedChoiceLabel: {
    color: COLORS.TEXT_WHITE,
    fontSize: 16,
  },
  
  choiceText: {
    fontSize: 18,
    fontWeight: '600' as any,
    color: COLORS.TEXT_WHITE,
    marginBottom: 8,
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  votedChoiceText: {
    fontSize: 20,
    fontWeight: '800' as any,
  },
  
  voteStats: {
    fontSize: 16,
    fontWeight: '800' as any,
    color: COLORS.TEXT_WHITE,
    textAlign: 'right',
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  votedVoteStats: {
    fontSize: 18,
  },
  
  votedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 18,
    fontWeight: '900' as any,
    color: COLORS.TEXT_WHITE,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: COLORS.SHADOW,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },
});