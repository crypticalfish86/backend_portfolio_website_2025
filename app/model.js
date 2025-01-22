/**
    The model is responsible for retrieving data (via sql or file retrieval) and manipulate that data as needed for the endpoint
 */
const fs = require('fs').promises;
const connection = require('../database/connection.js');


const fetchEndpoints = () => {
    return fs.readFile('./app/EndpointInfo.JSON', 'utf-8')
        .then(file => {
            return file; // Return the file content if the file is found
        })
        .catch(error => {
            if (error.code === 'ENOENT') {
                // File not found, return a 404 error
                return Promise.reject({ status: 404, msg: 'Endpoint JSON file not found' });
            } else {
                // Other errors (e.g., permission issues), return a 500 error
                return Promise.reject({ status: 500, msg: 'Internal Server Error' });
            }
        });
};


module.exports = { fetchEndpoints };