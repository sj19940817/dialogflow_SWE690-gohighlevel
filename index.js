const express = require('express');
const bodyParser = require('body-parser');
const expressApp = express().use(bodyParser.json());
const axios = require('axios');
const { dialogflow, Permission } = require('actions-on-google');
const app = dialogflow({ debug: true });
const port = process.env.PORT || 8080;

const APPOINTMENT_ENDPOINT = 'https://rest.gohighlevel.com/v1/appointments/';
const CALENDAR_TEAM_ENDPOINT =
  'https://rest.gohighlevel.com/v1/calendars/teams';
const CONTACT_ENDPOINT = 'https://rest.gohighlevel.com/v1/contacts/';
const TIMEZONE = 'America/Los_Angeles';
const BEARER_TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6Imo4ZVdaU2ZObndSUUhkakxkVkN2IiwiY29tcGFueV9pZCI6IkJrUzZTUTF2T0k3NmQxU2ZvaW42IiwidmVyc2lvbiI6MSwiaWF0IjoxNjQ2OTgwNTMxNzk1LCJzdWIiOiJJTVhLUENlRndNQXlVNUc3TmV5TSJ9.JO8_nFUPZwyVnEd46lerAr909TXte-X4Di9iOdGq99M';
let startDate;
let endDate;
const CONFIRMED = 'confirmed';

/**
 * This is the Dialogflow part.
 *
 * @param {String} startDate epoch format
 * @param {String} endDate epoch format
 */
app.intent('greeting', (conv) => {
  return conv.ask(
    new Permission({
      context: 'Hello.',
      permissions: conv.data.requestedPermission,
    })
  );
});

app.intent('set an appointment', (conv, params, permissionGranted) => {
  {
    if (permissionGranted) {
      const { requestedPermission } = conv.data;
      if (requestedPermission) {
        const { date, time } = conv.device;
        const deviceDateTime = date.setTime(time);
        startDate = Date.parse(deviceDateTime) || Math.round(Date.now() / 1000);
        endDate =
          Date.parse(deviceDateTime.setDate(deviceDateTime.getDate() + 30)) ||
          Math.round(Date.now().setDate(32) / 1000);
      }
    }

    if (conv) {
      // proceed received data...
    } else
      return conv.close(
        'Please provide required information for your appointment.'
      );
  }
});

/**
 * This is the gohighlevel part.
 *
 * Make external APIs calls to gohighlevel.
 * @property {Array} availableSlots
 * @return {String} teamId, selectedSlot, email, phone, contactId, appointmentId
 */

let teamId = '',
  availableSlots = [],
  selectedSlot = '',
  email = '',
  phone = '',
  contactId = '',
  appointmentId = '',
  appointmentStatus = '',
  startTime = '',
  endTime = '';

const generateCalendarSlotEndPoint = (teamId, startDate, endDate) => {
  return `https://rest.gohighlevel.com/v1/appointments/slots?calendarId=${teamId}&startDate=${startDate}&endDate=${endDate}&timezone=${TIMEZONE}`;
};

const endpoints = [
  CALENDAR_TEAM_ENDPOINT,
  generateCalendarSlotEndPoint(teamId, startDate, endDate),
  CONTACT_ENDPOINT,
];

// assumption: choose the first slot, choose the first contact.
// customer's choices will be sent from DF
axios
  .all(
    endpoints.map((endpoint) =>
      axios.get(endpoint, { Authorization: BEARER_TOKEN })
    )
  )
  .then(
    axios.spread((response1, response2, response3) => {
      teamId = response1.data.teams[0].id;
      availableSlots = response2.data._dates_.slots;
      selectedSlot = availableSlots[0];
      contactId = response3.data.contacts[0].id;
      email = response3.data.contacts[0].email;
      phone = response3.data.contacts[0].phone;
      return teamId, selectedSlot, contactId, email, phone;
    })
  )
  .catch((error) => console.log(`Error when getting data: ${error.message}`));

// post an appointment
axios
  .post(
    APPOINTMENT_ENDPOINT,
    {
      calendarId: teamId,
      email,
      phone,
      selectedSlot,
      selectedTimezone: TIMEZONE,
    },
    { Authorization: BEARER_TOKEN }
  )
  .then((response) => {
    appointmentId = response.data.id;
    return appointmentId;
  })
  .catch((error) =>
    console.log(`Error when creating an appointment: ${error.message}`)
  );

axios
  .get(`${APPOINTMENT_ENDPOINT}:${appointmentId}`, {
    Authorization: BEARER_TOKEN,
  })
  .then((response) => {
    appointmentStatus = response.data.appointmentStatus;
    startTime = response.data.startTime;
    endTime = response.data.endTime;
    return appointmentStatus === CONFIRMED
      ? `Your appointment is ${appointmentStatus}, from ${startTime} to ${endTime}`
      : `Your appointment is ${appointmentStatus}. Please try again.`;
  })
  .catch((error) =>
    console.log(`Error when confirming an appointment: ${error.message}`)
  );

// Routing
expressApp.get('/', (_, res) => {
  res.status(200).send('Successful response.');
});

// send confirmed appointment info to Dialogflow...
expressApp.post('/webhook', app, (_, res) => {
  res.send();
});

expressApp.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
