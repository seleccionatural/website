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

    // CRITICAL: Email sending logic using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    // Enhanced email template with customer information
    const emailData = {
      from: 'Portfolio <onboarding@resend.dev>', // Use Resend's default domain or your verified domain
      to: ['seleccionatural.xyz@gmail.com'], // Your email address
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

    // CRITICAL: Call Resend API to send email
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', response.status, errorText)
      throw new Error(`Resend API error: ${response.status} - ${errorText}`)
    }

    const emailResponse = await response.json()
    console.log('Email sent successfully:', emailResponse)

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
SETUP INSTRUCTIONS FOR RESEND EMAIL FUNCTIONALITY:

1. Add Resend API Key to Supabase Environment Variables:
   - Go to your Supabase project dashboard
   - Navigate to Settings > Edge Functions
   - Add environment variable: RESEND_API_KEY=re_LQ15H52q_CNzNXHc8Ha3LbobGBM7ajHYJ

2. The Edge Function is now configured to use Resend API:
   - Uses your provided API key: re_LQ15H52q_CNzNXHc8Ha3LbobGBM7ajHYJ
   - Sends emails to: seleccionatural.xyz@gmail.com
   - Uses Resend's default domain for sending (onboarding@resend.dev)

3. Email Template Features:
   - Professional HTML styling with responsive design
   - Customer contact information (name, email, comments)
   - Complete artwork details (title, type, description, ID)
   - Direct link to view the artwork image
   - Timestamp of the inquiry
   - Mobile-friendly email client support

4. Error Handling:
   - Validates API key presence
   - Handles Resend API errors with detailed logging
   - Returns appropriate success/error responses to client
   - Includes CORS headers for browser compatibility

5. Testing the Functionality:
   - Click the "Purchase Inquiry" button on any artwork
   - Fill out the contact form (name, email, comments)
   - Click "Send Inquiry"
   - Check your email at seleccionatural.xyz@gmail.com
   - Monitor the function logs in Supabase dashboard for any errors

6. Production Considerations:
   - For production use, consider verifying your own domain with Resend
   - This would allow you to send from your own domain (e.g., noreply@yourdomain.com)
   - The current setup uses Resend's default domain which works for testing

The email functionality is now fully integrated and ready to use!
*/