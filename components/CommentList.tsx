import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Avatar, IconButton, ActivityIndicator } from 'react-native-paper';
import { Comment } from '../types';
import { COLORS, MESSAGES } from '../constants';
import { formatDateTime } from '../utils/formatters';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  canDeleteComment: (comment: Comment) => boolean;
  onDeleteComment: (commentId: string) => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  loading,
  canDeleteComment,
  onDeleteComment,
}) => {
  const renderComment = ({ item: comment }: { item: Comment }) => {
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <Avatar.Icon
            size={32}
            icon="account"
            style={styles.commentAvatar}
          />
          <View style={styles.commentInfo}>
            <Text style={styles.commentAuthor}>
              {comment.user?.nickname || '不明'}
            </Text>
            <Text style={styles.commentDate}>
              {formatDateTime(comment.created_at)}
            </Text>
          </View>
          {canDeleteComment(comment) && (
            <IconButton
              icon="delete"
              size={20}
              onPress={() => onDeleteComment(comment.id)}
              style={styles.deleteButton}
            />
          )}
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator 
        size="small" 
        color={COLORS.SECONDARY} 
        style={styles.loader} 
      />
    );
  }

  if (comments.length === 0) {
    return (
      <Text style={styles.noCommentsText}>
        {MESSAGES.EMPTY_COMMENTS}
      </Text>
    );
  }

  return (
    <FlatList
      data={comments}
      renderItem={renderComment}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    marginVertical: 16,
  },
  noCommentsText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHTER,
    paddingVertical: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    backgroundColor: COLORS.SECONDARY,
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  deleteButton: {
    marginLeft: 8,
  },
  commentContent: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
    marginLeft: 44,
  },
});