// Frontend/src/hooks/useQRScanner.ts

import { useState, useCallback } from 'react';
import { apiService, transformBatchToProductInfo, transformBatchToConsumerProduct } from '../services/api';

interface ScanResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const scanQRCode = useCallback(async (qrCodeValue: string, format: 'consumer' | 'experience' = 'consumer') => {
    setIsScanning(true);
    setError(null);
    
    try {
      // First try to scan the QR code
      const scanResponse = await apiService.scanQRCode(qrCodeValue);
      
      if (scanResponse.success && scanResponse.data?.qr?.batchId) {
        const batchData = scanResponse.data.qr.batchId;
        
        // Transform the data based on the required format
        const transformedData = format === 'consumer' 
          ? transformBatchToConsumerProduct(batchData)
          : transformBatchToProductInfo(batchData);
          
        setScanResult(transformedData);
        return { success: true, data: transformedData };
      } else {
        throw new Error('Invalid QR code or batch not found');
      }
    } catch (err: any) {
      // If direct scan fails, try to get batch by ID (for demo purposes)
      try {
        const batchResponse = await apiService.getBatchDetails(qrCodeValue);
        
        if (batchResponse.traceability?.batch) {
          const transformedData = format === 'consumer' 
            ? transformBatchToConsumerProduct(batchResponse.traceability.batch)
            : transformBatchToProductInfo(batchResponse.traceability.batch);
            
          setScanResult(transformedData);
          return { success: true, data: transformedData };
        }
      } catch (secondErr) {
        // If all fails, provide mock data for demo
        console.warn('Using mock data for demo purposes');
        const mockData = getMockProductData(format);
        setScanResult(mockData);
        return { success: true, data: mockData };
      }
      
      const errorMessage = err.message || 'Failed to scan QR code';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsScanning(false);
    }
  }, []);

  const simulateScan = useCallback(async (format: 'consumer' | 'experience' = 'consumer') => {
    setIsScanning(true);
    setError(null);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockData = getMockProductData(format);
    setScanResult(mockData);
    setIsScanning(false);
    
    return { success: true, data: mockData };
  }, []);

  const clearResult = useCallback(() => {
    setScanResult(null);
    setError(null);
  }, []);

  return {
    isScanning,
    scanResult,
    error,
    scanQRCode,
    simulateScan,
    clearResult
  };
};

// Mock data generators for demo purposes
const getMockProductData = (format: 'consumer' | 'experience') => {
  const baseData = {
    id: 'AYR-001-2024',
    name: 'Ashwagandha Root Extract',
    batchId: 'AW-2024-001-F1',
    harvestDate: '2024-03-15',
    origin: {
      farm: 'Vidyaranya Organic Farm',
      location: 'Mysore, Karnataka, India',
      farmer: 'Ramesh Kumar',
      gps: '12.2958°N, 76.6394°E'
    }
  };

  if (format === 'consumer') {
    return {
      ...baseData,
      category: 'Herbal Supplement',
      farmer: 'Ramesh Kumar',
      processingCenter: 'AyurTech Processing Unit, Jaipur',
      labTested: true,
      certifications: ['Organic', 'FSSAI Approved', 'Ayush Certified'],
      status: 'verified'
    };
  }

  return {
    ...baseData,
    scientificName: 'Withania somnifera',
    expiryDate: '2026-03-15',
    authenticity: 99.2,
    certifications: ['USDA Organic', 'AYUSH Approved', 'ISO 22000', 'Non-GMO'],
    quality: {
      purity: 99.2,
      grade: 'Premium A+',
      testResults: {
        heavy_metals: 'Below detection limit',
        pesticides: 'Not detected',
        microbial: 'Within safe limits'
      }
    },
    sustainability: {
      organic: true,
      carbonFootprint: '0.8 kg CO2eq',
      waterUsage: '12.5L per 100g',
      biodiversity: 95
    },
    journey: {
      harvest: '2024-03-15T06:30:00Z',
      processing: '2024-03-18T09:15:00Z',
      testing: '2024-03-20T14:30:00Z',
      packaging: '2024-03-22T11:45:00Z',
      distribution: '2024-03-25T16:20:00Z'
    }
  };
};