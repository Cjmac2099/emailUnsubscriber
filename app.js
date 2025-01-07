// exported gapiLoaded, gisLoaded, handleAuthClick, handleSignoutClick
require('dotenv').config();

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
export function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: process.env.API_KEY,
    discoveryDocs: [process.env.DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
export function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: process.env.CLIENT_ID,
    scope: process.envSCOPES,
    callback: handleAuthResponse,  // Proper callback function here
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after both gapi and gis are initialized.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
    // Bind the event handler for the authorization button click
    document.getElementById('authorize_button').addEventListener('click', handleAuthClick);
  }
}

/**
 * Sign in the user upon button click.
 */
export function handleAuthClick() {
  tokenClient.callback = handleAuthResponse;  // Callback set here to handle the response

  if (gapi.client.getToken() === null) {
    // Request user consent to access Gmail data
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip the consent screen if already authorized
    tokenClient.requestAccessToken({ prompt: '' });
  }

  console.log("Authorization Request");
}

/**
 * Handles the response after the authentication flow.
 */
async function handleAuthResponse(resp) {
  if (resp.error !== undefined) {
    throw resp;
  }
  document.getElementById('signout_button').style.visibility = 'visible';
  document.getElementById('authorize_button').innerText = 'Refresh';
  await listLabels();
}

/**
 * Sign out the user upon button click.
 */
export function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
  }
}

/**
 * Print all Labels in the authorized user's inbox.
 * If no labels are found, display an appropriate message.
 */
async function listLabels() {
  let response;
  try {
    response = await gapi.client.gmail.users.labels.list({
      'userId': 'me',
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }

  const labels = response.result.labels;
  if (!labels || labels.length == 0) {
    document.getElementById('content').innerText = 'No labels found.';
    return;
  }

  const output = labels.reduce(
    (str, label) => `${str}${label.name}\n`,
    'Labels:\n'
  );
  document.getElementById('content').innerText = output;
}
