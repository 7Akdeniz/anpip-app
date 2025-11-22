/**
 * COMMENT MODAL - TikTok-Style
 * 
 * Funktionen:
 * - Kommentare anzeigen
 * - Neuen Kommentar schreiben
 * - Kommentare liken
 * - Auf Kommentare antworten
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  username: string;
  comment_text: string;
  created_at: string;
  likes_count: number;
  is_liked?: boolean;
}

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  commentsCount?: number;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  videoId,
  commentsCount = 0,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  /**
   * Kommentare laden
   */
  const loadComments = async () => {
    if (!videoId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Kommentare:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadComments();
      // Fokus auf Input nach kurzer Verzögerung
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible, videoId]);

  /**
   * Kommentar senden
   */
  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      // TODO: Nutzer-ID aus AuthContext holen
      const userId = 'temp-user-id';
      const username = 'user';

      const { data, error } = await supabase
        .from('comments')
        .insert({
          video_id: videoId,
          user_id: userId,
          username,
          comment_text: commentText.trim(),
          likes_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Kommentar zur Liste hinzufügen
      setComments((prev) => [data, ...prev]);
      setCommentText('');
      inputRef.current?.blur();
    } catch (error) {
      console.error('Fehler beim Senden des Kommentars:', error);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Kommentar liken
   */
  const handleLikeComment = async (commentId: string) => {
    try {
      // Optimistic Update
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                is_liked: !c.is_liked,
                likes_count: c.is_liked ? c.likes_count - 1 : c.likes_count + 1,
              }
            : c
        )
      );

      // TODO: Backend-Call zum Liken
    } catch (error) {
      console.error('Fehler beim Liken:', error);
    }
  };

  /**
   * Zeitformat (relative Zeit)
   */
  const formatTime = (timestamp: string): string => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `${diffMins} Min`;
    if (diffHours < 24) return `${diffHours} Std`;
    if (diffDays < 7) return `${diffDays} T`;
    return created.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  /**
   * Render einzelner Kommentar
   */
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      {/* Avatar */}
      <View style={styles.commentAvatar}>
        <Ionicons name="person-outline" size={20} color="#FFFFFF" />
      </View>

      {/* Content */}
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Typography variant="body" style={styles.commentUsername}>
            {item.username || 'Anonym'}
          </Typography>
          <Typography variant="caption" style={styles.commentTime}>
            {formatTime(item.created_at)}
          </Typography>
        </View>

        <Typography variant="body" style={styles.commentText}>
          {item.comment_text}
        </Typography>

        {/* Actions */}
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => handleLikeComment(item.id)}>
            <Typography variant="caption" style={styles.commentActionText}>
              Antworten
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Like Button */}
      <TouchableOpacity
        style={styles.commentLikeButton}
        onPress={() => handleLikeComment(item.id)}
      >
        <Ionicons
          name={item.is_liked ? 'heart' : 'heart-outline'}
          size={20}
          color={item.is_liked ? '#FF3B5C' : 'rgba(255,255,255,0.6)'}
        />
        {item.likes_count > 0 && (
          <Typography variant="caption" style={styles.commentLikeCount}>
            {item.likes_count}
          </Typography>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h3" style={styles.title}>
              {commentsCount > 0
                ? `${commentsCount} Kommentar${commentsCount !== 1 ? 'e' : ''}`
                : 'Kommentare'}
            </Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="rgba(255,255,255,0.3)" />
              <Typography variant="body" style={styles.emptyText}>
                Noch keine Kommentare
              </Typography>
              <Typography variant="caption" style={styles.emptySubtext}>
                Sei der Erste und schreibe einen Kommentar!
              </Typography>
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.commentsList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Kommentar hinzufügen..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                style={[
                  styles.sendButton,
                  (!commentText.trim() || submitting) && styles.sendButtonDisabled,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons
                    name="send"
                    size={24}
                    color={commentText.trim() ? Colors.primary : 'rgba(255,255,255,0.3)'}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    fontSize: 16,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    fontSize: 14,
  },
  commentsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  commentTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  commentText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  commentActionText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  commentLikeButton: {
    alignItems: 'center',
    marginLeft: 12,
  },
  commentLikeCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
