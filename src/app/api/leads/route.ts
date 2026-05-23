import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

// Initialize Supabase client if keys are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Path to simulated emails database
const emailsFilePath = path.join(process.cwd(), "src/lib/simulated_emails.json");

export async function GET() {
  try {
    const data = await fs.readFile(emailsFilePath, "utf-8");
    const emails = JSON.parse(data || "[]");
    return NextResponse.json({ success: true, emails });
  } catch (error) {
    console.error("Failed to read simulated emails:", error);
    return NextResponse.json({ success: true, emails: [] });
  }
}

export async function POST(request: Request) {
  try {
    const lead = await request.json();
    const { full_name, email, project_location, configuration } = lead;

    // 1. Save to Supabase if configured
    let dbStatus = "skipped";
    let savedLeadId = `lead_${Math.random().toString(36).substr(2, 9)}`;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("leads")
        .insert([{
          full_name,
          email,
          project_location,
          configuration
        }])
        .select();

      if (error) {
        console.error("Supabase server insert error:", error);
      } else if (data && data[0]) {
        dbStatus = "saved";
        savedLeadId = data[0].id;
      }
    }

    // 2. Draft Luxury HTML Email
    const formattedCost = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(configuration.estimated_cost);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Blueprint Configuration Submission</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0b0b0c;
            color: #e5e5e5;
            margin: 0;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #111113;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          }
          .header {
            padding: 40px;
            background: #060607;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            text-align: center;
          }
          .brand-subtitle {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.3em;
            color: #C5A880;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .brand-title {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 0.1em;
            color: #ffffff;
            text-transform: uppercase;
            margin: 0;
          }
          .content {
            padding: 40px;
          }
          .section-title {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.15em;
            color: #C5A880;
            text-transform: uppercase;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
          }
          .meta-row td {
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            font-size: 13px;
          }
          .meta-row td.label {
            color: #8f8f94;
            width: 40%;
            text-transform: uppercase;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .meta-row td.value {
            color: #e5e5e5;
            font-weight: 500;
            text-align: right;
          }
          .price-block {
            background: rgba(197, 168, 128, 0.03);
            border: 1px solid rgba(197, 168, 128, 0.15);
            border-radius: 12px;
            padding: 24px;
            margin: 30px 0;
            text-align: center;
          }
          .price-label {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.2em;
            color: #8f8f94;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .price-val {
            font-size: 28px;
            font-weight: 800;
            color: #C5A880;
            margin: 0;
          }
          .footer {
            padding: 30px;
            background: #060607;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            text-align: center;
            font-size: 10px;
            color: #555558;
            letter-spacing: 0.05em;
            line-height: 1.6;
          }
          .footer a {
            color: #C5A880;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="brand-subtitle">Apex Design Labs</div>
            <div class="brand-title">Spec Registry Dispatched</div>
          </div>
          
          <div class="content">
            <p style="font-size: 13px; line-height: 1.6; color: #b5b5ba; margin-top: 0;">
              An architectural blueprint design code has been securely locked by a prospective client. Below are the verified project details and localized configurations:
            </p>

            <div class="section-title">01 / Client Profile</div>
            <table class="meta-table">
              <tr class="meta-row">
                <td class="label">Client Name</td>
                <td class="value">${full_name}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Contact Email</td>
                <td class="value">${email}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Project Site</td>
                <td class="value">${project_location}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Est. Timeline</td>
                <td class="value">${configuration.timeline}</td>
              </tr>
            </table>

            <div class="section-title">02 / Architectural Geometry</div>
            <table class="meta-table">
              <tr class="meta-row">
                <td class="label">Structure Style</td>
                <td class="value" style="color: #C5A880; font-weight: 700;">${configuration.house_style}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Home Footprint</td>
                <td class="value">${configuration.footprint}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Land Plot Size</td>
                <td class="value">${configuration.land_size}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Bedrooms / Layout</td>
                <td class="value">${configuration.rooms}</td>
              </tr>
            </table>

            <div class="section-title">03 / Premium Finishes & Eco Features</div>
            <table class="meta-table">
              <tr class="meta-row">
                <td class="label">Exterior Facade</td>
                <td class="value">${configuration.exterior_walls}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Flooring Finish</td>
                <td class="value">${configuration.flooring}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Reflecting Pool</td>
                <td class="value">${configuration.swimming_pool}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Roof Solar Array</td>
                <td class="value">${configuration.solar_array}</td>
              </tr>
              <tr class="meta-row">
                <td class="label">Firepit Lounge</td>
                <td class="value">${configuration.firepit_lounge}</td>
              </tr>
            </table>

            <div class="price-block">
              <div class="price-label">Estimated Scoping Valuation</div>
              <div class="price-val">${formattedCost}</div>
            </div>

            <p style="font-size: 11px; line-height: 1.6; color: #555558; margin-bottom: 0;">
              This specification sheet contains temporary regional cost calculations including architectural planning fees. Local zoning analysis will run automatically upon advisor assignment.
            </p>
          </div>
          
          <div class="footer">
            © 2026 Apex Design Labs. All rights reserved.<br>
            Secure Sandbox Configuration Registry Code: APX-${savedLeadId}
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Send Email Notification
    let emailStatus = "simulated";
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpTo = process.env.SMTP_TO || "owner@apexdesignlabs.com";

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          secure: parseInt(smtpPort, 10) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        await transporter.sendMail({
          from: `"Apex Spec Registry" <${smtpUser}>`,
          to: smtpTo,
          subject: `Locked Configuration - ${configuration.house_style} (${full_name})`,
          html: emailHtml
        });

        emailStatus = "sent";
      } catch (err) {
        console.error("Nodemailer failed to dispatch real email:", err);
      }
    }

    // 4. Save to simulated outbox JSON file
    const newSimulatedEmail = {
      id: `mail_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      to: smtpTo,
      subject: `Locked Configuration - ${configuration.house_style} (${full_name})`,
      client_name: full_name,
      client_email: email,
      html: emailHtml
    };

    try {
      const data = await fs.readFile(emailsFilePath, "utf-8");
      const emails = JSON.parse(data || "[]");
      emails.unshift(newSimulatedEmail);
      await fs.writeFile(emailsFilePath, JSON.stringify(emails, null, 2), "utf-8");
    } catch (writeErr) {
      console.error("Failed to write simulated email log file:", writeErr);
    }

    return NextResponse.json({
      success: true,
      id: savedLeadId,
      db_status: dbStatus,
      email_status: emailStatus,
      email_preview: newSimulatedEmail
    });

  } catch (error: any) {
    console.error("Leads processing API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process lead" },
      { status: 500 }
    );
  }
}
