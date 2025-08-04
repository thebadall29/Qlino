const axios = require('axios');

// WhatsApp Cloud API configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const sendWhatsAppNotification = async (phoneNumber, appointmentDetails) => {
    try {
        const url = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
        
        // Format the message
        const message = `🏥 *Appointment Confirmation*\n\n`
            + `Dear ${appointmentDetails.patientName},\n\n`
            + `Your appointment has been confirmed with Dr. ${appointmentDetails.doctorName}.\n\n`
            + `📅 Date: ${appointmentDetails.date}\n`
            + `⏰ Time: ${appointmentDetails.time}\n`
            + `📍 Reason: ${appointmentDetails.reason}\n\n`
            + `Please arrive 10 minutes before your scheduled time.\n`
            + `If you need to reschedule, please contact us at least 24 hours before.\n\n`
            + `Thank you for choosing our services!`;

        const response = await axios.post(url, {
            messaging_product: "whatsapp",
            to: phoneNumber,
            type: "text",
            text: {
                body: message
            }
        }, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('WhatsApp notification sent successfully:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
        return { success: false, error: error.message };
    }
};

// Format phone number to WhatsApp format
const formatPhoneNumber = (phone) => {
    // Remove any non-numeric characters
    const numericOnly = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming Indian numbers)
    if (!numericOnly.startsWith('91') && numericOnly.length === 10) {
        return `91${numericOnly}`;
    }
    
    return numericOnly;
};

module.exports = {
    sendWhatsAppNotification,
    formatPhoneNumber
};
