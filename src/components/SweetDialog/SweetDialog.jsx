import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiInfo, FiTrash2, FiEdit } from 'react-icons/fi';
import './SweetDialog.css';

const SweetDialog = ({ 
  isOpen, 
  onClose, 
  type = 'success', // 'success', 'error', 'warning', 'info', 'confirm'
  title, 
  message, 
  duration = 3000,
  showCloseButton = true,
  onConfirm = null,
  onCancel = null,
  isConfirm = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
      
      // Don't auto-close confirmation dialogs
      if (duration > 0 && !isConfirm) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, duration, isConfirm]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="dialog-icon" />;
      case 'error':
        return <FiX className="dialog-icon" />;
      case 'warning':
        return <FiAlertTriangle className="dialog-icon" />;
      case 'info':
        return <FiInfo className="dialog-icon" />;
      case 'delete':
        return <FiTrash2 className="dialog-icon" />;
      case 'update':
        return <FiEdit className="dialog-icon" />;
      case 'confirm':
        return <FiAlertTriangle className="dialog-icon" />;
      default:
        return <FiCheck className="dialog-icon" />;
    }
  };

  const getEmoji = () => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'error':
        return '😞';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'delete':
        return '🗑️';
      case 'update':
        return '✏️';
      case 'confirm':
        return '🤔';
      default:
        return '🎉';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`sweet-dialog-overlay ${isAnimating ? 'animate-in' : 'animate-out'}`}>
      <div className={`sweet-dialog ${type} ${isAnimating ? 'slide-in' : 'slide-out'}`}>
        <div className="dialog-header">
          <div className="icon-container">
            {getIcon()}
            <span className="emoji">{getEmoji()}</span>
          </div>
          {showCloseButton && (
            <button className="close-btn" onClick={handleClose}>
              <FiX />
            </button>
          )}
        </div>
        
        <div className="dialog-content">
          {title && <h3 className="dialog-title">{title}</h3>}
          <p className="dialog-message">{message}</p>
        </div>
        
        <div className="dialog-actions">
          {isConfirm ? (
            <>
              <button className="dialog-btn secondary" onClick={() => {
                if (onCancel) onCancel();
                handleClose();
              }}>
                Cancel
              </button>
              <button className="dialog-btn primary" onClick={() => {
                if (onConfirm) onConfirm();
                handleClose();
              }}>
                Confirm
              </button>
            </>
          ) : (
            <button className="dialog-btn primary" onClick={handleClose}>
              Got it! 👍
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for easy usage
export const useSweetDialog = () => {
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    duration: 3000,
    isConfirm: false,
    onConfirm: null,
    onCancel: null
  });

  const showDialog = ({ type = 'success', title, message, duration = 3000, isConfirm = false, onConfirm = null, onCancel = null }) => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
      duration,
      isConfirm,
      onConfirm,
      onCancel
    });
  };

  const hideDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (message, title = 'Success!') => {
    showDialog({ type: 'success', title, message });
  };

  const showError = (message, title = 'Oops!') => {
    showDialog({ type: 'error', title, message });
  };

  const showWarning = (message, title = 'Warning!') => {
    showDialog({ type: 'warning', title, message });
  };

  const showInfo = (message, title = 'Info') => {
    showDialog({ type: 'info', title, message });
  };

  const showDeleteSuccess = (itemName) => {
    showDialog({ 
      type: 'delete', 
      title: 'Deleted Successfully!', 
      message: `${itemName} has been removed from the system. 🗑️` 
    });
  };

  const showUpdateSuccess = (itemName) => {
    showDialog({ 
      type: 'update', 
      title: 'Updated Successfully!', 
      message: `${itemName} has been updated with the latest information. ✨` 
    });
  };

  const showAddSuccess = (itemName) => {
    showDialog({ 
      type: 'success', 
      title: 'Added Successfully!', 
      message: `${itemName} has been added to the system. Welcome aboard! 🎉` 
    });
  };

  const showConfirm = (message, subtitle = '', title = 'Confirm Action') => {
    return new Promise((resolve) => {
      showDialog({
        type: 'confirm',
        title,
        message: subtitle ? `${message}\n${subtitle}` : message,
        isConfirm: true,
        duration: 0, // Don't auto-close
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };

  return {
    dialog,
    showDialog,
    hideDialog,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDeleteSuccess,
    showUpdateSuccess,
    showAddSuccess,
    showConfirm,
    DialogComponent: () => (
      <SweetDialog
        isOpen={dialog.isOpen}
        onClose={hideDialog}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        duration={dialog.duration}
        isConfirm={dialog.isConfirm}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    )
  };
};

export default SweetDialog;
