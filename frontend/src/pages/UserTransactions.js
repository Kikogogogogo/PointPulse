import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import useUserTransactions from '../hooks/useUserTransactions';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import theme from '../styles/theme';
import {
  FaSearch,
  FaPlus,
  FaMinus,
  FaExchangeAlt,
  FaCalendarAlt,
  FaFilter,
  FaChevronRight,
  FaChevronLeft,
  FaInfoCircle
} from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterInput = styled.div`
  width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PageControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.md};
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const PageInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-of-type {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};
  }
`;

const TransactionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing.md};
  flex-shrink: 0;
  
  ${({ type }) => {
    switch (type) {
      case 'purchase':
        return css`
          background-color: ${theme.colors.secondary.light};
          color: ${theme.colors.secondary.dark};
        `;
      case 'redemption':
        return css`
          background-color: ${theme.colors.accent.light};
          color: ${theme.colors.accent.dark};
        `;
      case 'transfer':
        return css`
          background-color: ${theme.colors.primary.light};
          color: ${theme.colors.primary.dark};
        `;
      case 'adjustment':
        return css`
          background-color: ${theme.colors.info.light};
          color: ${theme.colors.info.dark};
        `;
      case 'event':
        return css`
          background-color: ${theme.colors.success.light};
          color: ${theme.colors.success.dark};
        `;
      default:
        return css`
          background-color: ${theme.colors.border.light};
          color: ${theme.colors.text.secondary};
        `;
    }
  }}
`;

const TransactionInfo = styled.div`
  flex: 1;
  
  .transaction-id {
    font-weight: ${theme.typography.fontWeights.medium};
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.xs};
  }
  
  .transaction-type {
    font-weight: ${theme.typography.fontWeights.medium};
    font-size: ${theme.typography.fontSize.lg};
    margin-bottom: ${theme.spacing.xs};
  }
  
  .transaction-remark {
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.sm};
  }
  
  .transaction-date {
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.sm};
    margin-top: ${theme.spacing.xs};
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TransactionAmount = styled.div`
  font-weight: ${theme.typography.fontWeights.semiBold};
  font-size: ${theme.typography.fontSize.xl};
  margin-left: ${theme.spacing.md};
  flex-shrink: 0;
  
  ${({ positive }) =>
    positive
      ? css`
          color: ${theme.colors.success.main};
        `
      : css`
          color: ${theme.colors.error.main};
        `}
        
  @media (max-width: 768px) {
    margin-left: auto;
  }
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.md};
  
  p {
    margin-top: ${theme.spacing.md};
  }
`;

const UserTransactions = () => {
  // State for filters and pagination
  const [filters, setFilters] = useState({
    type: '',
    amount: '',
    operator: 'gte',
    page: 1,
    limit: 10
  });
  
  // Fetch transactions with the current filters
  const { 
    transactions, 
    totalCount, 
    isLoading 
  } = useUserTransactions(filters);
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      // If changing a filter value, reset to page 1
      const newFilters = key === 'page' ? { ...prev, [key]: value } : { ...prev, [key]: value, page: 1 };
      return newFilters;
    });
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format time for display
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get the appropriate icon for a transaction type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <FaPlus />;
      case 'redemption':
        return <FaMinus />;
      case 'transfer':
        return <FaExchangeAlt />;
      case 'adjustment':
        return <FaExchangeAlt />;
      case 'event':
        return <FaCalendarAlt />;
      default:
        return <FaExchangeAlt />;
    }
  };
  
  // Format transaction label for display
  const getTransactionLabel = (transaction) => {
    switch (transaction.type) {
      case 'purchase':
        return `Purchase - $${transaction.spent?.toFixed(2) || '0.00'}`;
      case 'redemption':
        if (transaction.processedBy) {
          return `Redemption - Completed`;
        }
        return `Redemption - Pending`;
      case 'transfer':
        if (transaction.amount > 0) {
          if (transaction.senderName && transaction.sender) {
            return `Transfer from ${transaction.senderName} (${transaction.sender})`;
          }
          return `Transfer from ${transaction.sender || transaction.senderName || 'user'}`;
        }
        if (transaction.recipientName && transaction.recipient) {
          return `Transfer to ${transaction.recipientName} (${transaction.recipient})`;
        }
        return `Transfer to ${transaction.recipient || transaction.recipientName || 'user'}`;
      case 'adjustment':
        return `Adjustment from ${transaction.createdBy || 'manager'}`;
      case 'event':
        return `Event Reward - ${transaction.relatedId || 'Event'}`;
      default:
        return 'Transaction';
    }
  };
  
  // Check if transaction amount is positive
  const isPositiveTransaction = (transaction) => {
    return transaction.amount > 0;
  };
  
  // Format amount for display
  const formatAmount = (amount) => {
    return `${amount > 0 ? '+' : ''}${amount} pts`;
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(filters.page * filters.limit, totalCount);
  
  return (
    <div>
      <PageTitle>My Transactions</PageTitle>
      
      <FilterSection>
        <FilterInput>
          <Select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            placeholder="Transaction Type"
          >
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="redemption">Redemption</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
            <option value="event">Event</option>
          </Select>
        </FilterInput>
        
        <FilterInput>
          <Select
            value={filters.operator}
            onChange={(e) => handleFilterChange('operator', e.target.value)}
            placeholder="Amount Operator"
          >
            <option value="gte">Greater than or equal</option>
            <option value="lte">Less than or equal</option>
          </Select>
        </FilterInput>
        
        <FilterInput>
          <Input
            placeholder="Amount"
            value={filters.amount}
            onChange={(e) => handleFilterChange('amount', e.target.value)}
            type="number"
          />
        </FilterInput>
      </FilterSection>
      
      <Card>
        {isLoading ? (
          <LoadingSpinner text="Loading transactions..." />
        ) : transactions.length > 0 ? (
          <>
            <Card.Body>
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id}>
                  <TransactionIcon type={transaction.type}>
                    {getTransactionIcon(transaction.type)}
                  </TransactionIcon>
                  <TransactionInfo>
                    <div className="transaction-id">Transaction #{transaction.id}</div>
                    <div className="transaction-type">{getTransactionLabel(transaction)}</div>
                    <div className="transaction-remark">
                      {transaction.remark || 'No remark'}
                    </div>
                    {transaction.createdAt && (
                      <div className="transaction-date">
                        {formatDate(transaction.createdAt)} {formatTime(transaction.createdAt)}
                      </div>
                    )}
                  </TransactionInfo>
                  <TransactionAmount positive={isPositiveTransaction(transaction)}>
                    {formatAmount(transaction.amount)}
                  </TransactionAmount>
                </TransactionItem>
              ))}
            </Card.Body>
            
            <PageControls>
              <PageInfo>
                Showing {startIndex} to {endIndex} of {totalCount} transactions
              </PageInfo>
              
              <Pagination>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page === 1}
                >
                  <FaChevronLeft /> Previous
                </Button>
                
                <PageInfo>
                  Page {filters.page} of {totalPages || 1}
                </PageInfo>
                
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page >= totalPages}
                >
                  Next <FaChevronRight />
                </Button>
              </Pagination>
            </PageControls>
          </>
        ) : (
          <EmptyState>
            <FaInfoCircle size={32} />
            <p>No transactions found</p>
            {filters.type || filters.amount ? (
              <p>Try changing your filters to see more results</p>
            ) : (
              <p>Complete transactions to view your history</p>
            )}
          </EmptyState>
        )}
      </Card>
    </div>
  );
};

export default UserTransactions; 