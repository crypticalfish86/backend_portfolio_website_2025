/*
    Controller is responsible for handling incoming requests, processing the input of those requests and sending the responses
*/

const { editProjectDetailByID } = require('./model/Detail_model');
const { fetchAllProjects, fetchProjectByID, insertNewProject, editProjectByID } = require('./model/Project_model');

const fs = require('fs').promises;

/*
    GET /api 
    Return a parsed JSON file containing information on all the endpoints
*/
const getEndpoints = (request, response, next) =>
{
    fs.readFile('./app/EndpointInfo.JSON', 'utf-8')
    .then( JSONFile => {
        response.status(200).send(JSON.parse(JSONFile));
    })
    .catch(error => {
        if(error.code === 'ENOENT') {
            next({status: 404, msg: 'Endpoint JSON file not found'})
        } else {
            next({status: 500, msg: 'Internal Server Error'})
        }
    });
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

const patchProjectByID = (request, response, next) =>
{
    const projectID = request.params.projectID;
    const informationToUpdate = request.body;
    editProjectByID(projectID, informationToUpdate)
    .then(updatedProject => {
        response.status(200).send(updatedProject);
    })
    .catch(error => next(error));
}

const patchProjectDetailByID = (request, response, next) =>
{
    const projectID = request.params.projectID;
    const projectDetailID = request.params.projectDetailID;
    const informationToUpdate = request.body;
    editProjectDetailByID(projectID, projectDetailID, informationToUpdate)
    .then(updatedDetail => {
        response.status(200).send(updatedDetail);
    })
    .catch(error => next(error));
}

module.exports = { getEndpoints, getAllProjects, getProjectByID, postNewProject, patchProjectByID, patchProjectDetailByID };