const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());//cors prevents users from making requests to different domains

app.get('/api', getEndpoints); //return all endpoints possible with this api

app.get('/api/project_titles', getAllTitles); //return every single project title as an array

app.get('/api/project_titles/:project_id', getProjectByID);//return all information (projects, project_details, images) about one project in an object