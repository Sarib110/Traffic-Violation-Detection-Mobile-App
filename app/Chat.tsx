import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const { width } = Dimensions.get('window');

const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Traffic Violations Detection AI assistant. I can help you with questions about traffic violations, detection systems, and traffic rules. What would you like to know?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Groq API configuration
  const GROQ_API_KEY = "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";

  // Real AI responses using Groq API
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Using Llama 3 model
          messages: [
            {
              role: 'system',
              content: 'You are a specialized AI assistant for Traffic Violations Detection systems. You only answer questions related to traffic violations, traffic rules, vehicle detection, traffic safety, road regulations, and similar topics. If users ask about unrelated topics, politely redirect them to ask about traffic violations detection instead. Provide concise, technical, and helpful responses suitable for mobile chat. Focus on practical aspects of traffic violation detection systems, technologies used and traffic rules.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          top_p: 1,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw error;
    }
  };

  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopTypingAnimation = () => {
    typingAnimation.stopAnimation();
    typingAnimation.setValue(0);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    startTypingAnimation();

    try {
      const aiResponse = await getAIResponse(userMessage.text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the AI service right now. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      stopTypingAnimation();
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}>
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userMessage : styles.botMessage,
        ]}>
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.botMessageText,
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={[
        styles.timestamp,
        message.isUser ? styles.userTimestamp : styles.botTimestamp,
      ]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessageContainer]}>
      <View style={[styles.messageBubble, styles.botMessage, styles.typingBubble]}>
        <View style={styles.typingContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.typingDot,
                {
                  opacity: typingAnimation,
                  transform: [
                    {
                      translateY: typingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 25}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/Help")}>
          <Feather name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Assistant</Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          keyboardHeight > 0 && Platform.OS === 'android' && {
            paddingBottom: keyboardHeight > 0 ? 20 : 20
          }
        ]}
        showsVerticalScrollIndicator={false}>
        {messages.map(renderMessage)}
        {isTyping && renderTypingIndicator()}
      </ScrollView>

      {/* Input */}
      <View style={[
        styles.inputContainer,
        Platform.OS === 'android' && keyboardHeight > 0 && {
          marginBottom: 0
        }
      ]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about traffic violations detection..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}>
            <Text style={[
              styles.sendButtonText,
              inputText.trim() ? styles.sendButtonTextActive : styles.sendButtonTextInactive,
            ]}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 16,
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: width * 0.85,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  userMessage: {
    backgroundColor: '#007bff',
    borderBottomRightRadius: 6,
  },
  botMessage: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: '#212529',
  },
  timestamp: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  userTimestamp: {
    color: '#6c757d',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#6c757d',
    textAlign: 'left',
  },
  typingBubble: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6c757d',
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    maxHeight: 100,
    marginRight: 12,
    paddingVertical: 8,
    textAlignVertical: 'center',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonActive: {
    backgroundColor: '#007bff',
  },
  sendButtonInactive: {
    backgroundColor: 'transparent',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sendButtonTextActive: {
    color: '#ffffff',
  },
  sendButtonTextInactive: {
    color: '#6c757d',
  },
});

export default ChatbotScreen;