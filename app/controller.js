/*
    Controller is responsible for handling incoming requests, processing the input of those requests and sending the responses
*/

const { fetchEndpoints } = require('./model');

//returns a parsed JSON file containing all the endpoints available by this api
const getEndpoints = (request, response, next) =>
{
    fetchEndpoints()
    .then( JSONFile => {
        response.status(200).send(JSON.parse(JSONFile));
    })
    .catch(error => next(error));
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