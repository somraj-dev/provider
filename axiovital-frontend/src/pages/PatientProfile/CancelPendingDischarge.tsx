import React from 'react';
import { CancelDischarge } from './CancelDischarge';

interface CancelPendingDischargeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CancelPendingDischarge: React.FC<CancelPendingDischargeProps> = ({ isOpen, onClose }) => {
  return <CancelDischarge isOpen={isOpen} onClose={onClose} title="Cancel Pending Discharge" />;
};
export default CancelPendingDischarge;
