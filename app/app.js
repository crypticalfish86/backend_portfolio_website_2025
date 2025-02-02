/*
    The app.use get called in order of the line number, any app.use written before your endpoints 
    triggers before and every single app.use after your endpoints triggers after 
    (which is why the unhandled error app.use is positioned afterwards)
*/

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

const { getEndpoints, getAllProjects, getProjectByID, postNewProject, patchProjectByID, patchProjectDetailByID, /*patchImageByID, deleteProjectByID*/ } = require('./controller.js');
const connection = require('../database/connection.js');

app.use(cors());//call cors before every single api request, prevents users from making requests to different domains
app.use(express.json());//call express.json() before every single api request, allows us to automatically parse incoming a JSON requests so we don't need to do it in the controller


app.get('/api', getEndpoints); //return all endpoints possible with this api

app.get('/api/projects', getAllProjects); //return every single projects in an array (for displaying the project files with titles)

app.get('/api/projects/:projectID', getProjectByID); //return all information (projects, project_details, images) about one project (activated when clicking a file)

app.post('/api/projects', postNewProject); //Add a new project to the database (with project_details and images included)

app.patch('/api/projects/:projectID', patchProjectByID); //Edit an existing project using the project ID

app.patch('/api/projectDetail/:projectID/:projectDetailID', patchProjectDetailByID); //Edit an existing project details using the ProjectID and ProjectDetailID

//app.patch('/api/images/:projectID/:projectDetailID/:imageID', patchImageByDetailAndImageID); //Edit an existing image using the ProjectID, ProjectDetailID and imageID

//app.delete('/api/projects/:projectID', deleteProjectByID); //Delete a project by its project ID

//app.delete('/api/projectDetail/:projectID/:projectDetailID', deleteProjectDetailByID); 

//any Unhandled error is caught by this at the end
app.use((err, req, res, next) => {
    let status;
    if (err.status){
        status = err.status;
    } else{
        status = 500;
    }
    res.status(status).json({ error: err.msg });
});

app.listen(port, () => {console.log(`Listening at http://localhost:${port}`)})

module.exports = app; //export the app to be used elsewhere