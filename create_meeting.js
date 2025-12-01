/**
 * create_meeting.js
 * Simple Jitsi meeting creation helper: for demo we will generate a random room name and a URL using meet.jit.si
 * For production you can self-host Jitsi or integrate Zoom API for authenticated meetings.
 */

const randomString = (len=10) => [...Array(len)].map(()=>Math.random().toString(36)[2]).join('');

function createJitsiMeeting({name, contact}) {
  const room = 'EASYDOC-' + randomString(12);
  const url = `https://meet.jit.si/${room}`;
  // Optionally include config parameters (subject, etc.) - Jitsi public instance ignores many params
  return {room, url};
}

module.exports = { createJitsiMeeting };
