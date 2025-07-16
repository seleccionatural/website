import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      artworkId, 
      artworkTitle, 
      artworkDescription, 
      artworkType, 
      artworkImage, 
      customerName,
      customerEmail,
      customerComments,
      timestamp 
    } = await req.json()

    // CRITICAL: Email sending logic using a third-party service
    // You'll need to replace this with your preferred email service
    // Popular options: SendGrid, Resend, Mailgun, Amazon SES
    
    // Enhanced email template with customer information
    const emailData = {
      to: 'seleccionatural.xyz@gmail.com', // Your email address
      subject: `Purchase Inquiry - ${artworkTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">New Purchase Inquiry</h2>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #4F46E5; margin-bottom: 15px;">Customer Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Name:</td>
                  <td style="padding: 8px 0; color: #333;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 8px 0; color: #333;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Comments:</td>
                  <td style="padding: 8px 0; color: #333;">${customerComments || 'No additional comments'}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #4F46E5; margin-bottom: 15px;">Artwork Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Title:</td>
                  <td style="padding: 8px 0; color: #333;">${artworkTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Type:</td>
                  <td style="padding: 8px 0; color: #333;">${artworkType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Description:</td>
                  <td style="padding: 8px 0; color: #333;">${artworkDescription}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Artwork ID:</td>
                  <td style="padding: 8px 0; color: #333; font-family: monospace;">${artworkId}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 20px 0; text-align: center;">
              <a href="${artworkImage}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Artwork</a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
              <p><strong>Inquiry Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
              <p><em>This inquiry was sent from your portfolio website.</em></p>
            </div>
          </div>
        </div>
      `
    }

    // CRITICAL: Replace this section with your chosen email service
    // Example for SendGrid:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'seleccionatural.xyz@gmail.com' }],
          subject: emailData.subject
        }],
        from: { email: 'noreply@yourdomain.com' },
        content: [{
          type: 'text/html',
          value: emailData.html
        }]
      })
    })
    */

    // Example for Resend (RECOMMENDED):
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio <noreply@yourdomain.com>',
        to: ['seleccionatural.xyz@gmail.com'],
        subject: emailData.subject,
        html: emailData.html
      })
    })
    */

    // PLACEHOLDER: For now, we'll simulate a successful email send
    // Replace this with actual email service integration
    console.log('Email would be sent:', emailData)
    
    // Simulate API response
    const emailResponse = { success: true, id: 'simulated-email-id' }

    if (emailResponse.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Purchase inquiry sent successfully',
          emailId: emailResponse.id 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      throw new Error('Failed to send email')
    }

  } catch (error) {
    console.error('Error sending purchase inquiry:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send purchase inquiry' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

/* 
SETUP INSTRUCTIONS FOR EMAIL FUNCTIONALITY:

1. Choose an Email Service Provider:
   - Resend (RECOMMENDED): https://resend.com/ - Modern, developer-friendly, generous free tier
   - SendGrid: https://sendgrid.com/ - Reliable, widely used
   - Mailgun: https://www.mailgun.com/ - Good for developers
   - Amazon SES: https://aws.amazon.com/ses/ - Cost-effective for high volume

2. Get API Key:
   - Sign up for your chosen service
   - Generate an API key from their dashboard
   - For Resend: Go to API Keys section and create a new key
   - For SendGrid: Go to Settings > API Keys and create a new key

3. Configure Supabase Environment Variables:
   - Go to your Supabase project dashboard
   - Navigate to Settings > Edge Functions
   - Add environment variables:
     - For Resend: RESEND_API_KEY=your_api_key_here
     - For SendGrid: SENDGRID_API_KEY=your_api_key_here

4. Update the Code:
   - Uncomment and modify the appropriate email service section above
   - Replace 'seleccionatural.xyz@gmail.com' with your actual email
   - For Resend: Replace 'noreply@yourdomain.com' with your verified domain
   - For SendGrid: Set up sender authentication in SendGrid dashboard

5. Domain Verification (Important):
   - For production use, verify your sending domain with your email service
   - This improves deliverability and prevents emails from going to spam
   - Follow your email service's domain verification guide

6. Deploy the Function:
   - This function will be automatically deployed when you save it
   - Test it by clicking the purchase button on an artwork

7. Verify Email Delivery:
   - Check your email inbox for test inquiries
   - Monitor the function logs in Supabase dashboard for any errors
   - Check spam folder if emails don't arrive

RECOMMENDED SETUP (Resend):
1. Sign up at resend.com
2. Verify your domain (or use their test domain for development)
3. Create an API key
4. Add RESEND_API_KEY to Supabase environment variables
5. Uncomment the Resend section above
6. Test the functionality

The email template includes:
- Professional HTML styling
- Customer contact information
- Artwork details
- Direct link to view the artwork
- Timestamp of the inquiry
- Responsive design for mobile email clients
*/