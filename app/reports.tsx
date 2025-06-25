import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAllReports } from './services/reportStorage';
interface Report {
  id: string;
  reportId?: string;
  senderId?: string;
  senderName?: string;
  timestamp: string;
  location: string;
  status: 'Submitted' | 'Accepted' | 'Rejected' | 'submitted';
  violationType: string;
  confidence?: number;
  videoUri?: string;
  details?: any;
  mlResults?: any;
}

// Define colors for consistency across the app
const colors = {
  text: '#1a1a1a',
  background: '#f8f9fa',
  border: '#E0E0E0',
  cardBackground: '#FFFFFF',
};


// Generate a report ID based on location and type
const generateReportId = (location: string, violationType: string) => {
  const locationPrefix = location.substring(0, 2).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${locationPrefix}-${randomNum}`;
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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'submitted':
      return '#3498db';  // Updated to a softer blue
    case 'accepted':
      return '#2ecc71';  // Updated to a softer green
    case 'rejected':
      return '#e74c3c';  // Updated to a softer red
    default:
      return '#000000';
  }
};

const ReportCard = ({ report }: { report: Report }) => {
  // Format the status text to capitalize first letter
  const formattedStatus = report.status.charAt(0).toUpperCase() + report.status.slice(1).toLowerCase();
  
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeaderContainer}>
        <View style={styles.idContainer}>
          <Text style={styles.reportId}>Report #{report.reportId || generateReportId(report.location, report.violationType)}</Text>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(report.status) }
            ]}
          >
            <Text style={styles.statusText}>{formattedStatus}</Text>
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
        {report.confidence && (
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🙍‍♂️</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Citizen ID</Text>
              <Text style={styles.value}>LA-7431</Text>
            </View>
          </View>
        )}
        {report.senderId && report.senderName && (
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Reporter</Text>
              <Text style={styles.value}>{report.senderName} (ID: {report.senderId})</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const Reports = () => {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load reports from AsyncStorage using the reportStorage service
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        
        // Load reports using the existing getAllReports function
        const savedReports = await getAllReports();
        console.log('Saved Reports:', savedReports);
        if (savedReports && savedReports.length > 0) {
        const validReports = savedReports.filter(
          (report: any) =>
            report &&
            typeof report.location === 'string' &&
            typeof report.violationType === 'string'
        );
          // Transform the data if needed to match the Report interface
          const formattedReports = savedReports.map((report: any) => ({
            id: report.id,
            reportId: report.reportId || generateReportId(report.location, report.violationType),
            timestamp: report.timestamp,
            location: report.location || "Unknown location",
            status: report.status || "submitted",
            violationType: report.violationType || "Traffic violation",
            confidence: report.confidence || 0,
            videoUri: report.videoUri || null,
            details: report.details || {},
            mlResults: report.mlResults || {}
          }));
          
          setReports(formattedReports);
        } else {
        console.warn('No reports found or invalid data.');
        setReports([]);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      Alert.alert(
        'Error',
        'Failed to load reports. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  loadReports();
  }, []);
  
  // Function to refresh reports
  const refreshReports = async () => {
    setLoading(true);
    try {
      const savedReports = await getAllReports();
      if (savedReports && savedReports.length > 0) {
        setReports(savedReports);
      }
    } catch (error) {
      console.error('Failed to refresh reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/settings")}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Violation Reports</Text>
        <TouchableOpacity onPress={refreshReports} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : reports.length > 0 ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReportCard report={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refreshReports}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No reports found</Text>
          <Text style={styles.emptySubText}>Submit a traffic violation to see it here</Text>
        </View>
      )}
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
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 16,
  },
  refreshButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Reports;