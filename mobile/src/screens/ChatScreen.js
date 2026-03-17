import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { chatService } from '../services/api';

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await chatService.getHistory();
      const formattedHistory = [];

      response.data.history.forEach((item) => {
        formattedHistory.push({
          id: `user-${item.id}`,
          type: 'user',
          text: item.message,
          timestamp: new Date(item.created_at),
        });
        formattedHistory.push({
          id: `bot-${item.id}`,
          type: 'bot',
          text: item.response,
          timestamp: new Date(item.created_at),
        });
      });

      if (formattedHistory.length === 0) {
        formattedHistory.push({
          id: 'welcome',
          type: 'bot',
          text: "Hey there! 👋 I'm your EUPHORIA companion. I'm here to help you with anything about your cycle, symptoms, nutrition, or just to chat! What's on your mind?",
          timestamp: new Date(),
        });
      }

      setMessages(formattedHistory);
      setHistoryLoaded(true);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          text: "Hey there! 👋 I'm your EUPHORIA companion. I'm here to help you with anything about your cycle, symptoms, nutrition, or just to chat! What's on your mind?",
          timestamp: new Date(),
        },
      ]);
      setHistoryLoaded(true);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(inputMessage);
      const botMsg = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: response.data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        id: `bot-error-${Date.now()}`,
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'user' ? styles.userMessage : styles.botMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.type === 'user'
            ? styles.userBubble
            : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.type === 'user'
              ? styles.userText
              : styles.botText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  if (!historyLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>EUPHORIA Chat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholderTextColor="#999"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    color: '#8b5cf6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  messageList: {
    padding: 12,
  },
  messageContainer: {
    marginVertical: 6,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#8b5cf6',
  },
  botBubble: {
    backgroundColor: '#e9ecef',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ChatScreen;
