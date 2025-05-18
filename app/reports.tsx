import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Report {
  id: string;
  reportId: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  location: string;
  status: 'Submitted' | 'Accepted' | 'Rejected';
  violationType: string;
}

// Define colors for consistency across the app
const colors = {
  text: '#1a1a1a',
  background: '#f8f9fa',
  border: '#E0E0E0',
  cardBackground: '#FFFFFF',
};



const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${month} ${day}, ${year} ${hours}:${minutes}`;
};

const getStatusColor = (status: Report['status']) => {
  switch (status) {
    case 'Submitted':
      return '#3498db';  // Updated to a softer blue
    case 'Accepted':
      return '#2ecc71';  // Updated to a softer green
    case 'Rejected':
      return '#e74c3c';  // Updated to a softer red
    default:
      return '#000000';
  }
};

const ReportCard = ({ report }: { report: Report }) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardHeaderContainer}>
      <View style={styles.idContainer}>
        <Text style={styles.reportId}>Report #{report.reportId}</Text>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(report.status) }
          ]}
        >
          <Text style={styles.statusText}>{report.status}</Text>
        </View>
      </View>
      <Text style={styles.timestamp}>
        {formatDate(report.timestamp)}
      </Text>
    </View>

    <View style={styles.detailsContainer}>
      <View style={styles.detailRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{report.location}</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Violation Type</Text>
          <Text style={styles.value}>{report.violationType}</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👤</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Reporter</Text>
          <Text style={styles.value}>{report.senderName} (ID: {report.senderId})</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const Reports = () => {
  const router = useRouter();
  
  const reports: Report[] = [
    {
      id: '1',
      reportId: 'LA-1187',
      senderId: 'BAD-1823',
      senderName: 'Syed Sarib',
      timestamp: '2025-01-21T10:30:00',
      location: 'Lahore, Punjab, PK',
      status: 'Accepted',
      violationType: 'Illegal Parking'
    },
    {
      id: '2',
      reportId: 'SX-1021',
      senderId: 'BAD-1823',
      senderName: 'Syed Sarib',
      timestamp: '2025-01-21T11:45:00',
      location: 'Ban Hafiz, Mianwali, PK',
      status: 'Rejected',
      violationType: 'Signal Violation'
    },
    {
      id: '3',
      reportId: 'TW-7861',
      senderId: 'BAD-1823',
      senderName: 'Syed Sarib',
      timestamp: '2025-01-21T12:15:00',
      location: 'Blue Area, Islamabad, PK',
      status: 'Submitted',
      violationType: 'Speeding'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/settings")}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Violation Reports</Text>
      </View>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReportCard report={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: width - 32,
  },
  cardHeaderContainer: {
    marginBottom: 16,
  },
  idContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    color: '#666666',
    fontSize: 14,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
});

export default Reports;