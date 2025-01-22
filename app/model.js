/**
    The model is responsible for retrieving data (via sql or file retrieval) and manipulate that data as needed for the endpoint
 */
const fs = require('fs').promises;

const fetchEndpoints = () => 
{
    return fs.readFile('./app/EndpointInfo.JSON', 'utf-8');
}


module.exports = { fetchEndpoints };