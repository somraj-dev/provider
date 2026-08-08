import React from 'react';
import { CancelTransfer } from './CancelTransfer';

interface CancelPendingTransferProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CancelPendingTransfer: React.FC<CancelPendingTransferProps> = ({ isOpen, onClose }) => {
  return <CancelTransfer isOpen={isOpen} onClose={onClose} title="Cancel Pending Transfer" />;
};
export default CancelPendingTransfer;
