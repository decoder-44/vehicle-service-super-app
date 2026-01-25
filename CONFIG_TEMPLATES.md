/**
 * Configuration Templates for Future Phases
 * These are example configurations for external services
 * Update these files in src/config/ when implementing respective modules
 */

// ===== src/config/razorpay.js =====
// EXAMPLE - Create this file when implementing payment module

/*
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
*/

// ===== src/config/google-maps.js =====
// EXAMPLE - Create this file when implementing location module

/*
import axios from 'axios';

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

export const geocodeAddress = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
  );
  return response.data;
};

export const reverseGeocode = async (lat, lng) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`
  );
  return response.data;
};

export const getDistance = async (origin, destination) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${googleMapsApiKey}`
  );
  return response.data;
};
*/

// ===== src/config/kyc.js =====
// EXAMPLE - Create this file when implementing KYC module

/*
import axios from 'axios';
import logger from '../utils/logger.js';

const kycProvider = process.env.KYC_PROVIDER || 'sandbox'; // 'sandbox' or 'signzy'

export const initiatAadharKYC = async (aadharNumber) => {
  if (kycProvider === 'sandbox') {
    // Sandbox.co.in implementation
    try {
      const response = await axios.post(`${process.env.KYC_API_URL}/aadhar/init`, 
        { aadhar_number: aadharNumber },
        {
          headers: {
            'Authorization': `Bearer ${process.env.KYC_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Aadhar KYC initiation error:', error);
      throw error;
    }
  }
  // Signzy implementation would go here
};

export const verifyAadharOTP = async (otp, transactionId) => {
  // Implementation details
};

export const verifyPAN = async (panNumber) => {
  // Implementation details
};

export const verifyFaceMatch = async (selfieUrl, documentPhotoUrl) => {
  // Implementation details
};
*/

// ===== src/config/sms.js =====
// EXAMPLE - Create this file when implementing notifications

/*
import twilio from 'twilio';
import axios from 'axios';
import logger from '../utils/logger.js';

const smsProvider = process.env.SMS_PROVIDER || 'twilio'; // 'twilio' or 'msg91'

let twilioClient;

if (smsProvider === 'twilio') {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export const sendSMS = async (phone, message) => {
  try {
    if (smsProvider === 'twilio') {
      const response = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      logger.info(`SMS sent to ${phone}: ${response.sid}`);
      return { success: true, messageId: response.sid };
    } else if (smsProvider === 'msg91') {
      const response = await axios.get('https://api.msg91.com/apiv2/SendOTP', {
        params: {
          mobile: phone.replace('+', ''),
          authkey: process.env.MSG91_AUTH_KEY,
          otp: message,
          sender: process.env.MSG91_SENDER_ID,
        }
      });
      logger.info(`SMS sent to ${phone} via MSG91`);
      return { success: true };
    }
  } catch (error) {
    logger.error('SMS send error:', error);
    throw error;
  }
};
*/

// ===== src/config/email.js =====
// EXAMPLE - Create this file when implementing notifications

/*
import nodemailer from 'nodemailer';
import axios from 'axios';
import logger from '../utils/logger.js';

const emailProvider = process.env.EMAIL_PROVIDER || 'nodemailer'; // 'nodemailer' or 'sendgrid'

let transporter;

if (emailProvider === 'nodemailer') {
  transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    }
  });
}

export const sendEmail = async (to, subject, htmlBody) => {
  try {
    if (emailProvider === 'nodemailer') {
      const response = await transporter.sendMail({
        from: 'noreply@vehiclesuperapp.com',
        to,
        subject,
        html: htmlBody,
      });
      logger.info(`Email sent to ${to}: ${response.messageId}`);
      return { success: true, messageId: response.messageId };
    } else if (emailProvider === 'sendgrid') {
      const response = await axios.post('https://api.sendgrid.com/v3/mail/send', {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.SENDGRID_FROM_EMAIL },
        subject,
        content: [{ type: 'text/html', value: htmlBody }],
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      logger.info(`Email sent to ${to} via SendGrid`);
      return { success: true };
    }
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};
*/

// ===== src/config/storage.js =====
// EXAMPLE - Create this file when implementing file uploads

/*
import AWS from 'aws-sdk';
import axios from 'axios';
import logger from '../utils/logger.js';

const storageProvider = process.env.STORAGE_PROVIDER || 's3'; // 's3' or 'cloudinary'

let s3;

if (storageProvider === 's3') {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    region: process.env.AWS_S3_REGION,
  });
}

export const uploadFile = async (fileBuffer, fileName, mimeType) => {
  try {
    if (storageProvider === 's3') {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `uploads/${Date.now()}-${fileName}`,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read',
      };
      const response = await s3.upload(params).promise();
      logger.info(`File uploaded to S3: ${response.Location}`);
      return { success: true, url: response.Location };
    } else if (storageProvider === 'cloudinary') {
      // Cloudinary implementation
      // Use cloudinary npm package
    }
  } catch (error) {
    logger.error('File upload error:', error);
    throw error;
  }
};

export const deleteFile = async (fileUrl) => {
  // Implementation to delete files
};

export const generateSignedUrl = async (fileUrl, expirySeconds = 3600) => {
  // Generate time-limited signed URLs for private files
};
*/

// ===== src/config/socket.js =====
// EXAMPLE - Create this file when implementing real-time features

/*
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const configureSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
  });

  // Middleware to authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.user_id}`);

    // Join user-specific room
    socket.join(`user:${socket.user.user_id}`);
    socket.join(`role:${socket.user.role}`);

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.user_id}`);
    });
  });

  return io;
};
*/

// ===== Implementation Notes =====
/*
WHEN TO CREATE EACH CONFIG FILE:

1. razorpay.js
   - When: Implementing payment module (Phase 9)
   - Endpoints: POST /api/payment/create, POST /api/payment/verify
   
2. google-maps.js
   - When: Implementing location-based services (Phase 4+)
   - Used by: Mechanic matching, Rental search, Delivery tracking
   
3. kyc.js
   - When: Implementing KYC module (Phase 2)
   - Endpoints: POST /api/kyc/submit, POST /api/admin/kyc/approve
   
4. sms.js
   - When: Implementing notifications (Phase 8)
   - Usage: OTP delivery, Booking notifications, Order updates
   
5. email.js
   - When: Implementing notifications (Phase 8)
   - Usage: Welcome emails, KYC status, Order receipts
   
6. storage.js
   - When: Implementing file uploads (Phase 2+)
   - Usage: KYC documents, Product images, Vehicle photos, User profiles
   
7. socket.js
   - When: Implementing real-time features (Phase 4+)
   - Usage: Live tracking, Booking status, Notifications

ENVIRONMENT VARIABLES NEEDED FOR EACH:

Razorpay:
  - RAZORPAY_KEY_ID
  - RAZORPAY_KEY_SECRET
  - RAZORPAY_WEBHOOK_SECRET

Google Maps:
  - GOOGLE_MAPS_API_KEY

KYC:
  - KYC_PROVIDER (sandbox or signzy)
  - KYC_API_URL
  - KYC_API_KEY
  - KYC_API_SECRET

SMS:
  - SMS_PROVIDER (twilio or msg91)
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_PHONE_NUMBER
  - MSG91_AUTH_KEY
  - MSG91_SENDER_ID

Email:
  - EMAIL_PROVIDER (sendgrid or nodemailer)
  - SENDGRID_API_KEY
  - SENDGRID_FROM_EMAIL
  - NODEMAILER_HOST
  - NODEMAILER_PORT
  - NODEMAILER_USER
  - NODEMAILER_PASS

Storage:
  - STORAGE_PROVIDER (s3 or cloudinary)
  - AWS_S3_ACCESS_KEY
  - AWS_S3_SECRET_KEY
  - AWS_S3_BUCKET
  - AWS_S3_REGION
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET

All these are already in .env.example - just fill them in when needed!
*/

export default {};
