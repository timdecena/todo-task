import axios from 'axios';

/*
  This file creates one reusable axios instance for all HTTP requests in the app.
  Keeping a single client makes it easier to update the backend base URL in one place.
*/
// One axios client for the whole app.
// Change this baseURL when backend URL changes.
const httpClient = axios.create({
  baseURL: '/api',
});

export default httpClient;
