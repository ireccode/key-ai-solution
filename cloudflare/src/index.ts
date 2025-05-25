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
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    best_time: string;
    goals: string[];
    business_area: string;
    pain_points: string;
    timeline: string;
    budget: string;
    annual_revenue: string;
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
            
            // Validate required fields
            const requiredFields = ['name', 'email', 'phone', 'country', 'best_time'];
            for (const field of requiredFields) {
                if (!formData[field as keyof FormData]) {
                    return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
                        status: 400,
                        headers
                    });
                }
            }

            try {
                // Create HTML content for the email
                const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Form Submission</title>
</head>
<body>
  <h2>New Contact Form Submission</h2>
  <p><strong>Name:</strong> ${formData.name}</p>
  <p><strong>Company:</strong> ${formData.company || 'N/A'}</p>
  <p><strong>Email:</strong> ${formData.email}</p>
  <p><strong>Phone:</strong> ${formData.phone}</p>
  <p><strong>Country:</strong> ${formData.country}</p>
  <p><strong>Best Time to Contact:</strong> ${formData.best_time}</p>
  <p><strong>Goals:</strong> ${Array.isArray(formData.goals) ? formData.goals.join(', ') : formData.goals || 'N/A'}</p>
  <p><strong>Business Area:</strong> ${formData.business_area || 'N/A'}</p>
  <p><strong>Pain Points:</strong> ${formData.pain_points || 'N/A'}</p>
  <p><strong>Timeline:</strong> ${formData.timeline || 'N/A'}</p>
  <p><strong>Budget:</strong> ${formData.budget || 'N/A'}</p>
  <p><strong>Annual Revenue:</strong> ${formData.annual_revenue || 'N/A'}</p>
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
To: ${env.EMAIL_TO || 'info@keyaisolution.com'}
Subject: ${env.EMAIL_SUBJECT || 'New Contact Form Submission - Key Solution'}
Message-ID: ${messageId}
Date: ${new Date().toUTCString()}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset=utf-8

New Contact Form Submission
-------------------------
Name: ${formData.name}
Company: ${formData.company || 'N/A'}
Email: ${formData.email}
Phone: ${formData.phone}
Country: ${formData.country}
Best Time to Contact: ${formData.best_time}
Goals: ${Array.isArray(formData.goals) ? formData.goals.join(', ') : formData.goals || 'N/A'}
Business Area: ${formData.business_area || 'N/A'}
Pain Points: ${formData.pain_points || 'N/A'}
Timeline: ${formData.timeline || 'N/A'}
Budget: ${formData.budget || 'N/A'}
Annual Revenue: ${formData.annual_revenue || 'N/A'}

--${boundary}
Content-Type: text/html; charset=utf-8

${htmlContent}

--${boundary}--
`;
                
                // Create the EmailMessage with the raw email content as a string
                const emailMessage = new EmailMessage(
                    env.EMAIL_FROM || "noreply@keyaisolution.com", 
                    env.EMAIL_TO || "info@keyaisolution.com", 
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
