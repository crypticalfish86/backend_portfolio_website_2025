/*
    Controller is responsible for handling incoming requests, processing the input of those requests and sending the responses
*/

const { fetchEndpoints } = require('./model');

const getEndpoints = (request, response) =>
{
    fetchEndpoints()
    .then( JSONFile => {
        response.status(200).send(JSON.parse(JSONFile));
    })
}

const getAllTitles = (request, response) =>
{
    response.status(200).send();
}


const getProjectByTitle = (request, response) =>
{
    response.status(200).send();
}

module.exports = { getEndpoints, getAllTitles, getProjectByTitle };