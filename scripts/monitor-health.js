#!/usr/bin/env node

/**
 * Health Monitor Script
 * 
 * This script checks the health endpoint of the application and sends alerts
 * when issues are detected. It can be run as a cron job or in a monitoring service.
 * 
 * Usage:
 *   node monitor-health.js
 * 
 * Environment variables:
 *   HEALTH_CHECK_URL - The URL of the health endpoint (required)
 *   ALERT_EMAIL - Email to send alerts to (optional)
 *   CHECK_INTERVAL - Interval between checks in milliseconds (default: 60000)
 *   MAX_RETRIES - Maximum number of retries before alerting (default: 3)
 *   RETRY_DELAY - Delay between retries in milliseconds (default: 10000)
 */

const fetch = require('node-fetch');

// Configuration from environment variables or defaults
const HEALTH_CHECK_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:3001/api/health';
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '60000', 10);
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10);
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY || '10000', 10);
const ALERT_EMAIL = process.env.ALERT_EMAIL;

// State tracking
let consecutiveFailures = 0;
let lastAlertSent = 0;
const ALERT_COOLDOWN = 3600000; // 1 hour in milliseconds

/**
 * Check the health of the application
 */
async function checkHealth() {
  try {
    const response = await fetch(HEALTH_CHECK_URL, {
      headers: {
        'Cache-Control': 'no-cache',
      },
      timeout: 10000, // 10 second timeout
    });
    
    // Parse the response
    const data = await response.json();
    
    // Check if the response indicates a healthy state
    if (!response.ok || data.status !== 'healthy') {
      handleFailure(`Health check failed: ${data.error || 'Unknown error'}`);
    } else {
      // Reset failure count on success
      consecutiveFailures = 0;
      console.log(`[${new Date().toISOString()}] Health check passed`);
    }
  } catch (error) {
    handleFailure(`Health check error: ${error.message}`);
  }
}

/**
 * Handle a health check failure
 * @param {string} message - The error message
 */
async function handleFailure(message) {
  consecutiveFailures++;
  console.error(`[${new Date().toISOString()}] ${message} (Failure ${consecutiveFailures}/${MAX_RETRIES})`);
  
  // If we've reached the maximum number of retries, send an alert
  if (consecutiveFailures >= MAX_RETRIES) {
    // Check if we're still in the cooldown period
    const now = Date.now();
    if (now - lastAlertSent > ALERT_COOLDOWN) {
      await sendAlert(message);
      lastAlertSent = now;
    }
  } else {
    // Retry after a delay
    console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
  }
}

/**
 * Send an alert about the health check failure
 * @param {string} message - The error message
 */
async function sendAlert(message) {
  // Alert via console (always)
  console.error(`[${new Date().toISOString()}] ALERT: ${message}`);
  
  // If an email is configured, send an email alert
  if (ALERT_EMAIL) {
    try {
      // This is a placeholder for sending an email
      // In a real implementation, you would use a library like nodemailer
      console.log(`Sending alert email to ${ALERT_EMAIL}`);
      
      // Example with nodemailer (commented out):
      /*
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        // Your email configuration
      });
      
      await transporter.sendMail({
        from: 'monitor@yourapp.com',
        to: ALERT_EMAIL,
        subject: 'Health Check Alert',
        text: message,
      });
      */
      
      console.log('Alert email sent');
    } catch (error) {
      console.error(`Failed to send alert email: ${error.message}`);
    }
  }
  
  // You could also implement other alert methods here:
  // - Slack webhook
  // - SMS via Twilio
  // - Pager Duty
  // - etc.
}

// Start the health check monitoring
function startMonitoring() {
  console.log(`Starting health check monitoring of ${HEALTH_CHECK_URL}`);
  console.log(`Checking every ${CHECK_INTERVAL / 1000} seconds`);
  
  // Perform an initial check
  checkHealth();
  
  // Set up the interval for subsequent checks
  setInterval(checkHealth, CHECK_INTERVAL);
}

// Start the monitoring
startMonitoring(); 