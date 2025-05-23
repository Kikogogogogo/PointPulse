import api from './api';

const TransactionService = {
  // Create a purchase transaction (Cashier+)
  createPurchase: async (purchaseData) => {
    try {
      const response = await api.post('/transactions', {
        ...purchaseData,
        type: 'purchase',
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('amount')) {
            throw new Error('Invalid amount. Amount must be positive.');
          }
          throw new Error(data.message || 'Invalid purchase request. Please check the data and try again.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to create purchase transactions.');
        }
        
        if (status === 404) {
          throw new Error('User not found. Please verify the user information.');
        }
        
        throw new Error(data.message || 'Failed to create purchase');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Create an adjustment transaction (Manager+)
  createAdjustment: async (adjustmentData) => {
    try {
      const response = await api.post('/transactions', {
        ...adjustmentData,
        type: 'adjustment',
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data.message || 'Invalid adjustment data. Please check and try again.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to create adjustment transactions.');
        }
        
        if (status === 404) {
          throw new Error('User not found. Please verify the user information.');
        }
        
        throw new Error(data.message || 'Failed to create adjustment');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Process a redemption (Cashier+)
  processRedemption: async (transactionId) => {
    try {
      const response = await api.patch(`/transactions/${transactionId}/processed`, {
        processed: true,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error === 'Invalid transaction ID') {
            throw new Error('Invalid transaction ID');
          }
          
          if (data.error === 'No data provided') {
            throw new Error('No data provided');
          }
          
          if (data.error === 'Processed status must be true') {
            throw new Error('Processed status must be true');
          }
          
          if (data.error === 'Transaction is not a redemption') {
            throw new Error('Transaction is not a redemption');
          }
          
          if (data.error === 'Transaction has already been processed') {
            throw new Error('This redemption has already been processed.');
          }
          
          throw new Error(data.error || 'Invalid redemption processing request.');
        }
        
        if (status === 403) {
          if (data.error === 'Unauthorized to process redemptions') {
            throw new Error('You do not have permission to process redemptions.');
          }
          
          throw new Error(data.error || 'Unauthorized action');
        }
        
        if (status === 404) {
          if (data.error === 'Transaction not found') {
            throw new Error('Redemption transaction not found.');
          }
          
          throw new Error(data.error || 'Not found');
        }
        
        throw new Error(data.error || 'Failed to process redemption');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Mark a transaction as suspicious or not (Manager+)
  markAsSuspicious: async (transactionId, suspicious) => {
    try {
      const response = await api.patch(`/transactions/${transactionId}/suspicious`, {
        suspicious,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data.message || 'Invalid request to update suspicious status.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to mark transactions as suspicious.');
        }
        
        if (status === 404) {
          throw new Error('Transaction not found.');
        }
        
        throw new Error(data.message || 'Failed to update suspicious status');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Get all transactions (Manager+)
  getAllTransactions: async (params = {}) => {
    try {
      console.log('Fetching transactions with params:', params);
      
      const cleanParams = {};
      for (const [key, value] of Object.entries(params)) {
        // Allow relatedId=null to pass through
        if (key === 'relatedId' && value === null) {
           cleanParams[key] = null; // Keep null for serializer
        } else if (value === '' || value === null || value === undefined) {
          continue; // Skip other null/undefined/empty values
        } else if (typeof value === 'boolean') {
          cleanParams[key] = value.toString(); // Keep boolean conversion
        } else {
          cleanParams[key] = value; // Keep other values
        }
      }
      
      console.log('Clean params for API:', cleanParams);
      
      const response = await api.get('/transactions', { 
        params: cleanParams,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => {
              // Explicitly handle null for relatedId by sending key=null
              if (key === 'relatedId' && value === null) {
                return `${encodeURIComponent(key)}=null`; 
              }
              // Handle boolean serialization
              if (typeof value === 'boolean') {
                return `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`;
              }
              // Standard serialization for other types (excluding nulls not handled above)
              if (value !== null && value !== undefined) {
                 return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
              }
              return ''; // Skip other null/undefined values if they somehow got here
            })
            .filter(p => p !== '') // Remove empty parameters
            .join('&');
        }
      });
      
      console.log('Transaction response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 403) {
          throw new Error('You do not have permission to view all transactions.');
        }
        
        if (status === 400) {
          throw new Error(data.message || 'Invalid query parameters for transaction search.');
        }
        
        throw new Error(data.message || 'Failed to fetch transactions');
      }
      
      throw new Error('Network error: Could not retrieve transactions. Please check your connection.');
    }
  },

  // Get a specific transaction (Manager+)
  getTransaction: async (transactionId) => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 403) {
          throw new Error('You do not have permission to view this transaction.');
        }
        
        if (status === 404) {
          throw new Error('Transaction not found.');
        }
        
        throw new Error(data.message || 'Failed to fetch transaction');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },
  
  // Lookup a redemption transaction for processing (Cashier+)
  lookupRedemption: async (transactionId) => {
    try {
      const response = await api.get(`/transactions/lookup-redemption/${transactionId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error === 'Invalid transaction ID') {
            throw new Error('Invalid transaction ID');
          }
          
          if (data.error === 'Transaction is not a redemption') {
            throw new Error('Transaction is not a redemption request');
          }
          
          if (data.error === 'Redemption has already been processed') {
            throw new Error('This redemption has already been processed');
          }
          
          throw new Error(data.error || 'Invalid redemption lookup request');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to lookup redemption transactions');
        }
        
        if (status === 404) {
          throw new Error('Redemption transaction not found');
        }
        
        throw new Error(data.error || 'Failed to lookup redemption transaction');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },
  
  // Get pending redemption transactions (Cashier+)
  getPendingRedemptions: async (params = {}) => {
    try {
      const response = await api.get('/transactions/pending-redemptions', { params });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 403) {
          throw new Error('You do not have permission to view pending redemptions');
        }
        
        if (status === 400) {
          throw new Error(data.error || 'Invalid query parameters');
        }
        
        throw new Error(data.error || 'Failed to fetch pending redemptions');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },
};

export default TransactionService; 