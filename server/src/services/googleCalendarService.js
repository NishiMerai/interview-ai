import { google } from 'googleapis';
import crypto from 'crypto';

let oauth2Client;

function getOAuth2Client() {
  if (oauth2Client) return oauth2Client;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    throw new Error('Google Calendar configuration is incomplete. Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, or GOOGLE_REFRESH_TOKEN.');
  }

  oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

/**
 * Creates a Google Calendar Event and generates a Google Meet conference link.
 * 
 * @param {Object} params
 * @param {string} params.summary - Title of the event
 * @param {string} params.description - Event details
 * @param {Date} params.startDateTime - Start timestamp
 * @param {Date} params.endDateTime - End timestamp (start + 60 minutes)
 * @param {string} params.attendeeEmail - Candidate email
 * @returns {Promise<Object>} { eventId, googleMeetLink, startTime, endTime }
 */
export async function createGoogleMeetEvent({ summary, description, startDateTime, endDateTime, attendeeEmail }) {
  try {
    const auth = getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: summary || 'HR Interview',
      description: description || 'Interview scheduled through Interview AI.',
      location: 'Google Meet',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const response = await calendar.events.insert({
      calendarId,
      resource: event,
      conferenceDataVersion: 1, // Required to trigger Meet link generation
      sendUpdates: 'all', // Send email invite automatically
    });

    const eventData = response.data;
    
    // Detailed Logging Requirements
    console.log('=== GOOGLE CALENDAR API RESPONSE START ===');
    console.log('response.data:', JSON.stringify(eventData, null, 2));
    console.log('conferenceData:', JSON.stringify(eventData.conferenceData, null, 2));
    if (eventData.conferenceData) {
      console.log('conferenceData.entryPoints:', JSON.stringify(eventData.conferenceData.entryPoints, null, 2));
      console.log('conferenceData.conferenceId:', eventData.conferenceData.conferenceId);
    } else {
      console.log('conferenceData.entryPoints: undefined');
      console.log('conferenceData.conferenceId: undefined');
    }
    console.log('hangoutLink:', eventData.hangoutLink);
    console.log('=== GOOGLE CALENDAR API RESPONSE END ===');

    // Extract Meet URL from video entryPoint or hangoutLink fallback
    let googleMeetLink = eventData.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri;

    if (!googleMeetLink && eventData.hangoutLink) {
      googleMeetLink = eventData.hangoutLink;
    }

    console.log('Extracted Meet URL:', googleMeetLink);

    // Validate that a specific Google Meet link was created, not a generic fallback
    if (!googleMeetLink || googleMeetLink === 'https://meet.google.com/' || googleMeetLink === 'https://meet.google.com/landing') {
      throw new Error('Google Calendar created the event but failed to generate a valid Google Meet video conference link.');
    }

    return {
      eventId: eventData.id,
      googleMeetLink,
      startTime: eventData.start?.dateTime || eventData.start?.date,
      endTime: eventData.end?.dateTime || eventData.end?.date,
    };
  } catch (error) {
    console.error('Google Calendar Service Event Insertion Failure:', error);
    throw new Error('Google Calendar insertion failure: ' + error.message);
  }
}
