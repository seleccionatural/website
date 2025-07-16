import React, { useState } from 'react';
import { X, Mail, Check, AlertCircle } from 'lucide-react';

interface PurchaseEmailModalProps {
  artworkTitle: string;
  artworkId: string;
  artworkDescription: string;
  artworkType?: string;
  artworkImage: string;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  comments: string;
}

interface EmailState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}

const PurchaseEmailModal: React.FC<PurchaseEmailModalProps> = ({ 
  artworkTitle, 
  artworkId, 
  artworkDescription, 
  artworkType, 
  artworkImage, 
  onClose 
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    comments: ''
  });

  const [emailState, setEmailState] = useState<EmailState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.email.trim()) {
      setEmailState({
        isLoading: false,
        isSuccess: false,
        isError: true,
        message: 'Please fill in your name and email address.'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailState({
        isLoading: false,
        isSuccess: false,
        isError: true,
        message: 'Please enter a valid email address.'
      });
      return;
    }

    setEmailState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      message: 'Sending your inquiry...'
    });

    try {
      // CRITICAL: Call to Supabase Edge Function for email sending
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-purchase-inquiry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artworkId,
          artworkTitle,
          artworkDescription,
          artworkType: artworkType || 'Artwork',
          artworkImage,
          customerName: formData.name,
          customerEmail: formData.email,
          customerComments: formData.comments,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setEmailState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          message: 'Your inquiry has been sent successfully! We\'ll get back to you soon.'
        });
        
        // Auto-close modal after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to send inquiry');
      }
    } catch (error) {
      console.error('Error sending purchase inquiry:', error);
      setEmailState({
        isLoading: false,
        isSuccess: false,
        isError: true,
        message: 'Failed to send inquiry. Please try again or contact us directly.'
      });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Clear error messages after 5 seconds
  React.useEffect(() => {
    if (emailState.isError) {
      const timer = setTimeout(() => {
        setEmailState(prev => ({ ...prev, isError: false, message: '' }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [emailState.isError]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[120] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-2xl md:rounded-[38px] p-6 md:p-8 max-w-md mx-4 relative animate-in fade-in zoom-in duration-300 w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <X size={18} className="md:w-5 md:h-5" />
        </button>

        <div className="mb-4 md:mb-6">
          <h3 className="text-white text-lg md:text-xl font-semibold mb-2">Purchase Inquiry</h3>
          <p className="text-gray-400 text-sm md:text-base">{artworkTitle}</p>
          {artworkType && (
            <p className="text-blue-300 text-xs md:text-sm font-medium capitalize mt-1">{artworkType}</p>
          )}
        </div>

        {/* Email status messages */}
        {emailState.message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            emailState.isSuccess 
              ? 'bg-green-600 bg-opacity-20 border border-green-600 text-green-400'
              : emailState.isError
              ? 'bg-red-600 bg-opacity-20 border border-red-600 text-red-400'
              : 'bg-blue-600 bg-opacity-20 border border-blue-600 text-blue-400'
          }`}>
            {emailState.isLoading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            )}
            {emailState.isSuccess && <Check className="w-4 h-4" />}
            {emailState.isError && <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{emailState.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                name="name"
                placeholder="Your Name *"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={emailState.isLoading}
                className="w-full bg-gray-750 text-white placeholder-gray-500 px-3 md:px-4 py-2 md:py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm disabled:opacity-50"
              />
            </div>
            <div className="flex-1">
              <input
                type="email"
                name="email"
                placeholder="Your Email *"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={emailState.isLoading}
                className="w-full bg-gray-750 text-white placeholder-gray-500 px-3 md:px-4 py-2 md:py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <textarea
              name="comments"
              placeholder="Additional comments or questions (optional)"
              value={formData.comments}
              onChange={handleInputChange}
              rows={4}
              disabled={emailState.isLoading}
              className="w-full bg-gray-750 text-white placeholder-gray-500 px-3 md:px-4 py-2 md:py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={emailState.isLoading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={emailState.isLoading || emailState.isSuccess}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
            >
              {emailState.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Send Inquiry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseEmailModal;