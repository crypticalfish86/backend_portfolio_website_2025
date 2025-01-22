/*
    The app.use get called in order of the line number before every single api request
*/

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());//call cors before every single api request, prevents users from making requests to different domains
app.use(express.json());//call express.json() before every single api request, allows us to automatically parse incoming a JSON request bodies


app.get('/api', getEndpoints); //return all endpoints possible with this api

app.get('/api/project_titles', getAllTitles); //return every single project title as an array (for displaying the project files with titles)

app.get('/api/project_titles/:title', getProjectByID);//return all information (projects, project_details, images) about one project (activated when clicking a file)