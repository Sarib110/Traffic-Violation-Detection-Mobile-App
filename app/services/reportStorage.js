// services/reportStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing reports in AsyncStorage
const REPORTS_STORAGE_KEY = 'traffic_reports';

/**
 * Save a new traffic report to storage
 * @param {Object} report - The report object to save
 * @returns {Promise<Array>} - Promise resolving to the updated reports array
 */
export const saveReport = async (report) => {
  try {
    // await clearAllReports();
    // Generate a unique ID if not provided
    const reportToSave = {
      ...report,
      id: report.id || `report_${Date.now()}`,
      timestamp: report.timestamp || new Date().toISOString()
    };
    
    // Get existing reports
    const existingReportsJSON = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
    const existingReports = existingReportsJSON ? JSON.parse(existingReportsJSON) : [];
    
    // Add new report to the beginning of the array
    const updatedReports = [reportToSave, ...existingReports];
    
    // Save back to storage
    await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedReports));
    
    return updatedReports;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
};

/**
 * Get all stored traffic reports
 * @returns {Promise<Array>} - Promise resolving to the reports array
 */
export const getAllReports = async () => {
  try {
    const reportsJSON = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
    return reportsJSON ? JSON.parse(reportsJSON) : [];
  } catch (error) {
    console.error('Error getting reports:', error);
    throw error;
  }
};

/**
 * Get a specific report by ID
 * @param {string} reportId - The ID of the report to get
 * @returns {Promise<Object|null>} - Promise resolving to the report or null
 */
export const getReportById = async (reportId) => {
  try {
    const reports = await getAllReports();
    return reports.find(report => report.id === reportId) || null;
  } catch (error) {
    console.error('Error getting report by ID:', error);
    throw error;
  }
};

/**
 * Delete a report by ID
 * @param {string} reportId - The ID of the report to delete
 * @returns {Promise<Array>} - Promise resolving to the updated reports array
 */
export const deleteReport = async (reportId) => {
  try {
    const reports = await getAllReports();
    const updatedReports = reports.filter(report => report.id !== reportId);
    
    await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedReports));
    return updatedReports;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

/**
 * Clear all stored reports
 * @returns {Promise<void>}
 */
export const clearAllReports = async () => {
  try {
    await AsyncStorage.removeItem(REPORTS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing reports:', error);
    throw error;
  }
};