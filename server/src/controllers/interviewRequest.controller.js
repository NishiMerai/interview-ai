import InterviewRequest from '../models/InterviewRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createGoogleMeetEvent } from '../services/googleCalendarService.js';

// Helper to convert date and time string to Date object
export function parseDateTime(dateInput, timeStr) {
  const date = new Date(dateInput);
  if (!timeStr) return date;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

// Automatically transition accepted interviews past their scheduled time + 60 minutes to 'Completed'
async function autoUpdateCompleted() {
  try {
    const now = new Date();
    const acceptedRequests = await InterviewRequest.find({ status: 'Accepted' });
    for (const req of acceptedRequests) {
      if (req.adminScheduledDate && req.adminScheduledTime) {
        const scheduledTime = parseDateTime(req.adminScheduledDate, req.adminScheduledTime);
        const endTime = new Date(scheduledTime.getTime() + 60 * 60 * 1000); // 60 mins duration
        if (now > endTime) {
          req.status = 'Completed';
          await req.save();
        }
      }
    }
  } catch (error) {
    console.error('Error auto-updating completed interviews:', error.message);
  }
}

// User: Request Interview
export const requestInterview = asyncHandler(async (req, res) => {
  const { interviewType, preferredDate, preferredTime, adminRemark } = req.body;

  // Validate required inputs
  if (!interviewType || !preferredDate || !preferredTime) {
    res.status(400);
    throw new Error('Interview type, preferred date, and preferred time are required.');
  }

  // Prevent past dates
  const requestedDate = new Date(preferredDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate < today) {
    res.status(400);
    throw new Error('Preferred date cannot be in the past.');
  }

  // Disable duplicate pending requests
  const existingPending = await InterviewRequest.findOne({
    userId: req.user._id,
    status: 'Pending'
  });
  if (existingPending) {
    res.status(400);
    throw new Error('You already have a pending interview request.');
  }

  const interviewRequest = await InterviewRequest.create({
    userId: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    interviewType,
    preferredDate: requestedDate,
    preferredTime,
    adminRemark: adminRemark || '',
    status: 'Pending'
  });

  res.status(201).json({
    message: 'Interview request submitted successfully.',
    interviewRequest
  });
});

// User: Get My Interview Requests
export const getMyInterviews = asyncHandler(async (req, res) => {
  await autoUpdateCompleted();

  const requests = await InterviewRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ requests });
});

// Admin: Get All Requests with Search, Filter, Sort
export const getAdminInterviewRequests = asyncHandler(async (req, res) => {
  await autoUpdateCompleted();

  const { status, interviewType, q, sortBy, sortOrder } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (interviewType) {
    filter.interviewType = interviewType;
  }

  if (q) {
    const searchRegex = new RegExp(q, 'i');
    filter.$or = [
      { userName: searchRegex },
      { userEmail: searchRegex }
    ];
  }

  // Sort construction
  let sort = { createdAt: -1 }; // default: newest first

  if (sortBy) {
    const order = sortOrder === 'asc' || sortOrder === '1' ? 1 : -1;
    if (sortBy === 'Date' || sortBy === 'preferredDate') {
      sort = { preferredDate: order };
    } else if (sortBy === 'Status' || sortBy === 'status') {
      sort = { status: order };
    } else if (sortBy === 'User Name' || sortBy === 'userName') {
      sort = { userName: order };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    } else {
      sort = { [sortBy]: order };
    }
  }

  const requests = await InterviewRequest.find(filter).sort(sort);
  res.json({ requests });
});

// Admin: Get specific request
export const getAdminInterviewRequestById = asyncHandler(async (req, res) => {
  const request = await InterviewRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Interview request not found');
  }
  res.json({ request });
});

// Admin: Accept Request
export const acceptInterviewRequest = asyncHandler(async (req, res) => {
  const { adminScheduledDate, adminScheduledTime, adminRemark } = req.body;

  if (!adminScheduledDate || !adminScheduledTime) {
    res.status(400);
    throw new Error('Scheduled date and time are required.');
  }

  const request = await InterviewRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Interview request not found');
  }

  const startDateTime = parseDateTime(adminScheduledDate, adminScheduledTime);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 60 minutes duration

  let calendarEvent;
  try {
    calendarEvent = await createGoogleMeetEvent({
      summary: 'HR Interview',
      description: 'Interview scheduled through Interview AI.',
      startDateTime,
      endDateTime,
      attendeeEmail: request.userEmail
    });
    console.log('Calendar Event ID:', calendarEvent.eventId);
    console.log('Generated Meet URL:', calendarEvent.googleMeetLink);
  } catch (apiError) {
    console.error('Google API Error:', apiError);
    res.status(502);
    throw new Error('Unable to create Google Meet meeting.');
  }

  request.adminScheduledDate = new Date(adminScheduledDate);
  request.adminScheduledTime = adminScheduledTime;
  request.googleMeetLink = calendarEvent.googleMeetLink;
  request.calendarEventId = calendarEvent.eventId;
  request.meetingCreatedAt = new Date();
  request.adminRemark = adminRemark || '';
  request.status = 'Accepted';

  await request.save();

  res.json({
    message: 'Interview request accepted and scheduled successfully. Google Meet generated automatically.',
    request
  });
});

// Admin: Reject Request
export const rejectInterviewRequest = asyncHandler(async (req, res) => {
  const { adminRemark } = req.body;

  if (!adminRemark) {
    res.status(400);
    throw new Error('Rejection reason (admin remark) is required.');
  }

  const request = await InterviewRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Interview request not found');
  }

  request.adminRemark = adminRemark;
  request.status = 'Rejected';

  await request.save();

  res.json({
    message: 'Interview request rejected successfully.',
    request
  });
});

// Admin: Delete Request
export const deleteInterviewRequest = asyncHandler(async (req, res) => {
  const request = await InterviewRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Interview request not found');
  }

  await request.deleteOne();

  res.json({
    message: 'Interview request deleted successfully.'
  });
});
