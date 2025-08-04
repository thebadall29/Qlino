# WhatsApp Cloud API Setup Instructions

1. Create a Meta Developer Account:
   - Go to https://developers.facebook.com/
   - Sign up for a developer account if you don't have one

2. Create a Meta App:
   - Go to the Meta Developers Console
   - Click "Create App"
   - Select "Business" as the app type
   - Fill in your app details

3. Set up WhatsApp API:
   - In your app dashboard, find "WhatsApp" > "Getting Started"
   - Follow the setup wizard
   - Note down your:
     * WhatsApp Access Token
     * Phone Number ID

4. Configure Environment Variables:
   Add these to your .env file:
   ```
   WHATSAPP_ACCESS_TOKEN=your_access_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
   ```

5. Test Number Registration:
   - Initially, you can only send messages to registered test numbers
   - Add test phone numbers in the WhatsApp dashboard
   - For production, you'll need to submit your app for review

6. Message Template Approval:
   - For production, create message templates
   - Submit them for approval
   - Use approved templates for sending notifications

Note: The current implementation uses a simple text message. For production:
- Consider using approved message templates
- Implement retry logic for failed messages
- Add message status tracking
- Implement rate limiting
- Add proper error handling and logging
