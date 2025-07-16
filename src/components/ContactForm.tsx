import React, { useState } from 'react';
import { X, Mail, Check } from 'lucide-react';

interface ContactFormProps {
  artworkTitle: string;
  onClose: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ artworkTitle, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create email content
    const emailSubject = `Purchase Interest - ${artworkTitle}`;
    const emailBody = `
Name: ${formData.name}
Email: ${formData.email}

Comments:
${formData.comments}

Artwork: ${artworkTitle}
    `;

    // Create mailto link
    const mailtoLink = `mailto:seleccionatural.xyz@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Close form after 2 seconds
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isSubmitted) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[110] p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-gray-800 rounded-2xl md:rounded-[38px] p-6 md:p-8 max-w-sm md:max-w-md mx-4 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Check className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h3 className="text-white text-lg md:text-xl font-semibold mb-2">Email Sent!</h3>
          <p className="text-gray-300 text-sm md:text-base">Your inquiry has been sent successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[110] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-2xl md:rounded-[38px] p-6 md:p-8 max-w-sm md:max-w-md mx-4 relative animate-in fade-in zoom-in duration-300 w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <X size={18} className="md:w-5 md:h-5" />
        </button>

        <div className="mb-4 md:mb-6">
          <h3 className="text-white text-lg md:text-xl font-semibold mb-1 md:mb-2">Contact for Purchase</h3>
          <p className="text-gray-400 text-xs md:text-sm">{artworkTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-750 text-white placeholder-gray-500 px-3 md:px-4 py-2 md:py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
            </div>
            <div className="flex-1">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-750 text-white placeholder-gray-500 px-3 md:px-4 py-2 md:py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
            </div>
          </div>

          <div>
            <textarea
              name="comments"
              placeholder="Comments"
              value={formData.comments}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-gray-750 text-white placeholder-gray-500 px-3 md:px-4 py-2 md:py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gray-750 hover:bg-gray-600 disabled:bg-gray-700 text-white font-semibold py-2 md:py-3 px-6 md:px-8 rounded-full transition-colors duration-200 text-sm flex items-center justify-center gap-2 mx-auto"
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Mail size={14} className="md:w-4 md:h-4" />
                Send
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;