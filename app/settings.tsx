import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './auth-context'; // Adjust path if needed

// Type definitions for props
interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

interface ThankYouModalProps {
  visible: boolean;
  onClose: () => void;
}

// Star Rating Component
const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
          key={star} 
          onPress={() => setRating(star)}
          style={styles.starButton}
        >
          <Feather 
            name={rating >= star ? "star" : "star"} 
            size={32} 
            color={rating >= star ? "#f5dd4b" : "#d4d4d4"}
            style={styles.starIcon} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Thank You Modal Component
const ThankYouModal: React.FC<ThankYouModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.thankYouModalView}>
          <Feather name="check-circle" size={60} color="#32c759" />
          <Text style={styles.thankYouTitle}>Thank You!</Text>
          <Text style={styles.thankYouMessage}>Your feedback helps us improve the app experience for everyone.</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function SettingsScreen(): React.ReactNode {
  const [form, setForm] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
  });
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [thankYouModalVisible, setThankYouModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const router = useRouter();
  const { logout } = useAuth();

  // Define color scheme based on dark mode
  const colors = form.darkMode ? darkTheme : lightTheme;

  const handleRatingSubmit = () => {
    // Here you would typically send the rating and comment to your backend
    console.log('Rating submitted:', rating, comment);
    
    // Close the rating modal
    setRatingModalVisible(false);
    
    // Show thank you modal
    setThankYouModalVisible(true);
    
    // Reset the form for future use
    setRating(0);
    setComment('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/Camera")}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>
      <View style={[styles.profile, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => {
            // handle onPress
          }}>
          <View style={styles.profileAvatarWrapper}>
            <Image
              alt=""
              source={{
                uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
              }}
              style={styles.profileAvatar} />

            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}>
              <View style={styles.profileAction}>
                <Feather color="#fff" name="edit-3" size={15} />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View>
          <Text style={[styles.profileName, { color: colors.text }]}>Syed Sarib</Text>

          <Text style={[styles.profileAddress, { color: colors.subtext }]}>
            Level-0
          </Text>
        </View>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Preferences</Text>
          <TouchableOpacity
            onPress={() => {
              router.replace('/reports');
            }}
            style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#007afe' }]}>
              <Feather color="#fff" name="file-text" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>Reports</Text>

            <View style={styles.rowSpacer} />

            <Feather
              color={colors.chevronColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}
            style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#007afe' }]}>
              <Feather color="#fff" name="globe" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>Language</Text>

            <View style={styles.rowSpacer} />

            <Feather
              color={colors.chevronColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>

          <View style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#007afe' }]}>
              <Feather color="#fff" name="moon" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>

            <View style={styles.rowSpacer} />

            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={form.darkMode ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={darkMode => setForm({ ...form, darkMode })}
              value={form.darkMode} />
          </View>

          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}
            style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#007afe' }]}>
              <Feather
                color="#fff"
                name="navigation"
                size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>Location</Text>

            <View style={styles.rowSpacer} />

            <Feather
              color={colors.chevronColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>

          <View style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#007afe' }]}>
              <Feather color="#fff" name="at-sign" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>Email Notifications</Text>

            <View style={styles.rowSpacer} />

            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={form.emailNotifications ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={emailNotifications =>
                setForm({ ...form, emailNotifications })
              }
              value={form.emailNotifications} />
          </View>

          <View style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#007afe' }]}>
              <Feather color="#fff" name="bell" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>Push Notifications</Text>

            <View style={styles.rowSpacer} />

            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={form.pushNotifications ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={pushNotifications =>
                setForm({ ...form, pushNotifications })
              }
              value={form.pushNotifications} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Resources</Text>

          <TouchableOpacity
            onPress={() => {
              router.replace({
                pathname: '/AboutUs',
                params: { isDarkMode: String(form.darkMode) }
              });
            }}
            style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#32c759' }]}>
              <Feather color="#fff" name="mail" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>About Us</Text>

            <View style={styles.rowSpacer} />

            <Feather
              color={colors.chevronColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              router.replace('/ContactUs');
            }}
            style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#32c759' }]}>
              <Feather color="#fff" name="phone" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>Contact Us</Text>

            <View style={styles.rowSpacer} />

            <Feather
              color={colors.chevronColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRatingModalVisible(true);
            }}
            style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#32c759' }]}>
              <Feather color="#fff" name="star" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>Rate in App Store</Text>

            <View style={styles.rowSpacer} />

            <Feather
              color={colors.chevronColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              logout(); // Use the logout function from useAuth instead of navigating directly
            }}
            style={[styles.row, { backgroundColor: colors.rowBackground }]}>
            <View style={[styles.rowIcon, { backgroundColor: '#32c759' }]}>
              <Feather color="#fff" name="log-out" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: colors.text }]}>Logout</Text>

            <View style={styles.rowSpacer} />

            <Feather
              color={colors.chevronColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={ratingModalVisible}
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Rate Our App</Text>
              <TouchableOpacity onPress={() => setRatingModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubTitle, { color: colors.subtext }]}>
              How would you rate your experience with our app?
            </Text>
            
            <StarRating rating={rating} setRating={setRating} />
            
            <TextInput
              style={[styles.commentInput, { 
                backgroundColor: colors.rowBackground,
                color: colors.text,
                borderColor: colors.subtext
              }]}
              placeholder="Share your thoughts with us..."
              placeholderTextColor={colors.subtext}
              multiline={true}
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                { opacity: rating > 0 ? 1 : 0.5 }
              ]}
              disabled={rating === 0}
              onPress={handleRatingSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Thank You Modal */}
      <ThankYouModal 
        visible={thankYouModalVisible}
        onClose={() => setThankYouModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// Define color themes
const lightTheme = {
  background: '#fff',
  text: '#0c0c0c',
  subtext: '#989898',
  sectionTitle: '#9e9e9e',
  rowBackground: '#f2f2f2',
  chevronColor: '#C6C6C6',
};

const darkTheme = {
  background: '#121212',
  text: '#e0e0e0',
  subtext: '#a0a0a0',
  sectionTitle: '#7e7e7e',
  rowBackground: '#1e1e1e',
  chevronColor: '#808080',
};

const styles = StyleSheet.create({
  /** Container */
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  /** Profile */
  profile: {
    padding: 24,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 9999,
  },
  profileAction: {
    position: 'absolute',
    right: -4,
    bottom: -10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: '#007bff',
  },
  profileName: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileAddress: {
    marginTop: 5,
    fontSize: 16,
    textAlign: 'center',
  },
  /** Section */
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  /** Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 50,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Modal Styles */
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  modalSubTitle: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 6,
  },
  starIcon: {
    // Additional styling for star icons if needed
  },
  commentInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#32c759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 160,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  /** Thank You Modal */
  thankYouModalView: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    width: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  thankYouTitle: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '700',
    color: '#32c759',
  },
  thankYouMessage: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#32c759',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});