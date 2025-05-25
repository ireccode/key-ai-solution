// @ts-ignore: Cloudflare namespace imports are resolved at runtime
import { EmailMessage } from "cloudflare:email";

interface Env {
  SEND_EMAIL: any;
  // Environment variables and secrets
  EMAIL_FROM: string;
  EMAIL_TO: string;
  EMAIL_SUBJECT: string;
  API_KEY: string; // Secret for API authentication
}

interface FormData {
    // Required fields
    name: string;
    email: string;
    business_area: string;
    pain_points: string;
    timeline: string;
    budget: string;
    annual_revenue: string;
    
    // Optional fields that may have defaults
    contact_method: string; // Email, WhatsApp, or Phone
    company?: string;
    phone?: string;
    
    // Other form data
    goals?: string[];
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // Extract the origin from the request
        const origin = request.headers.get("Origin") || "https://keyaisolution.com";
        
        // Set CORS headers - allow requests from the origin that made the request
        const headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json"
        };

        // Handle CORS preflight requests
        if (request.method === "OPTIONS") {
            return new Response(null, { headers });
        }

        // For debugging - allow GET requests to check if the worker is running
        if (request.method === "GET") {
            return new Response(JSON.stringify({ 
                status: "Email worker running",
                environment: {
                    hasEmailBinding: typeof env.SEND_EMAIL !== "undefined"
                }
            }), { headers });
        }

        if (request.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), {
                status: 405,
                headers
            });
        }
        
        // Verify API key for security
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.substring(7) !== env.API_KEY) {
            console.log("Unauthorized access attempt");
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers
            });
        }

        try {
            const formData = await request.json();
            
            // Validate required fields based on the actual form
            const requiredFields = [
                { field: 'name', label: 'Full Name' },
                { field: 'email', label: 'Email' },
                { field: 'business_area', label: 'Business Area' },
                { field: 'pain_points', label: 'Pain Points' },
                { field: 'timeline', label: 'Timeline' },
                { field: 'budget', label: 'Budget' },
                { field: 'annual_revenue', label: 'Annual Revenue' }
            ];
            
            for (const { field, label } of requiredFields) {
                if (!formData[field]) {
                    return new Response(JSON.stringify({ 
                        error: `Missing required field: ${label}`,
                        field: field
                    }), {
                        status: 400,
                        headers
                    });
                }
            }
            
            // Set default contact method if not provided
            if (!formData.contact_method) {
                formData.contact_method = 'Email';
            }

            try {
                // Create HTML content for the email
                const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Form Submission</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    h2 { color: #4a6cf7; }
    .section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <h2>New Contact Form Submission</h2>
  
  <div class="section">
    <h3>Contact Information</h3>
    <p><span class="label">Name:</span> ${formData.name}</p>
    <p><span class="label">Email:</span> ${formData.email}</p>
    <p><span class="label">Preferred Contact Method:</span> ${formData.contact_method}</p>
    <p><span class="label">Phone:</span> ${formData.phone || 'Not provided'}</p>
    <p><span class="label">Company:</span> ${formData.company || 'Not provided'}</p>
  </div>
  
  <div class="section">
    <h3>Project Details</h3>
    <p><span class="label">Goals:</span> ${Array.isArray(formData.goals) ? formData.goals.join(', ') : formData.goals || 'Not specified'}</p>
    <p><span class="label">Business Area:</span> ${formData.business_area || 'Not specified'}</p>
    <p><span class="label">Pain Points:</span> ${formData.pain_points || 'Not specified'}</p>
    <p><span class="label">Timeline:</span> ${formData.timeline || 'Not specified'}</p>
    <p><span class="label">Budget:</span> ${formData.budget || 'Not specified'}</p>
    <p><span class="label">Annual Revenue:</span> ${formData.annual_revenue || 'Not specified'}</p>
  </div>
</body>
</html>
                `;

                // Generate a unique Message-ID
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(2, 10);
                const messageId = `<${timestamp}.${randomString}@keyaisolution.com>`;

                // Build a simple multipart MIME message as a string
                const boundary = "----EmailFormBoundary" + Math.random().toString(36).substring(2);
                const emailContent = 
`From: ${env.EMAIL_FROM || 'noreply@keyaisolution.com'}
To: ${env.EMAIL_TO || 'irek@smartechall.com'}
Subject: ${env.EMAIL_SUBJECT || 'New Contact Form Submission - Key Solution'}
Message-ID: ${messageId}
Date: ${new Date().toUTCString()}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset=utf-8

New Contact Form Submission
=========================

CONTACT INFORMATION:
-----------------
Name: ${formData.name}
Email: ${formData.email}
Preferred Contact Method: ${formData.contact_method}
Phone: ${formData.phone || 'Not provided'}
Company: ${formData.company || 'Not provided'}

PROJECT DETAILS:
--------------
Goals: ${Array.isArray(formData.goals) ? formData.goals.join(', ') : formData.goals || 'Not specified'}
Business Area: ${formData.business_area}
Pain Points: ${formData.pain_points}
Timeline: ${formData.timeline}
Budget: ${formData.budget}
Annual Revenue: ${formData.annual_revenue}

--${boundary}
Content-Type: text/html; charset=utf-8

${htmlContent}

--${boundary}--
`;
                
                // Create the EmailMessage with the raw email content as a string
                const emailMessage = new EmailMessage(
                    env.EMAIL_FROM || "noreply@keyaisolution.com", 
                    env.EMAIL_TO || "irek@smartechall.com", 
                    emailContent
                );
                
                // Send the email
                await env.SEND_EMAIL.send(emailMessage);
                
                return new Response(JSON.stringify({ 
                    success: true,
                    message: "Email sent successfully"
                }), {
                    status: 200,
                    headers
                });
            } catch (emailError) {
                console.error("Error sending email:", emailError);
                
                // If email fails, we will still return a success response with details
                return new Response(JSON.stringify({ 
                    success: true,
                    warning: "Your message was received, but there was an issue sending the email notification. Our team will still process your request.",
                    debug: "Email sending error: " + JSON.stringify(emailError)
                }), {
                    status: 200,
                    headers
                });
            }

        } catch (error) {
            console.error('Error processing form submission:', error);
            return new Response(JSON.stringify({ error: 'Internal server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}
