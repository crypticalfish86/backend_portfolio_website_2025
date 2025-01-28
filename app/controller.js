/*
    Controller is responsible for handling incoming requests, processing the input of those requests and sending the responses
*/

const { fetchEndpoints, fetchAllProjects, fetchProjectByID, insertNewProject } = require('./model');

//returns a parsed JSON file containing all the endpoints available by this api
const getEndpoints = (request, response, next) =>
{
    fetchEndpoints()
    .then( JSONFile => {
        response.status(200).send(JSON.parse(JSONFile));
    })
    .catch(error => next(error));
}

/*
    Returns all projects in an array, ordered by the request.query,
    should have 3 parameters:
    showOnly: filter out every project from the request apart from those that meet a criteria
    sortBy: groups things in a certain order by an attribute
    orderBy: Ascending, Descending or undefined of that order
*/
const getAllProjects = (request, response, next) =>
{
    const queryParameters = request.query;
    fetchAllProjects(queryParameters)
    .then(results => {
        response.status(200).send(results);
    })
    .catch(error => next(error));
}


const getProjectByID = (request, response, next) =>
{   
    const projectID = request.params.projectID;
    fetchProjectByID(projectID)
    .then(result => {
        response.status(200).send(result);
    })
    .catch(error => next(error));
}


const postNewProject = (request, response, next) => 
{
    const newProjectInformation = request.body;

    insertNewProject(request.body)
    .then(newProject => {
        response.status(201).send(newProject);
    })
    .catch(error => next(error));
}

module.exports = { getEndpoints, getAllProjects, getProjectByID, postNewProject };