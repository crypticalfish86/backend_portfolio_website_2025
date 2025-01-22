/*
    The app.use get called in order of the line number, any app.use written before your endpoints 
    triggers before and every single app.use after your endpoints triggers after 
    (which is why the unhandled error app.use is positioned afterwards)
*/

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

const { getEndpoints, getAllTitles, getProjectByTitle } = require('./controller.js');

app.use(cors());//call cors before every single api request, prevents users from making requests to different domains
app.use(express.json());//call express.json() before every single api request, allows us to automatically parse incoming a JSON request bodies


app.get('/api', getEndpoints); //return all endpoints possible with this api

app.get('/api/project_titles', getAllTitles); //return every single project title as an array (for displaying the project files with titles)

app.get('/api/project_titles/:title', getProjectByTitle);//return all information (projects, project_details, images) about one project (activated when clicking a file)


//any Unhandled error is caught by this at the end
app.use((err, req, res, next) => {
    console.error(err.stack);

    let status;
    if (err.status){
        status = err.status;
    } else{
        status = 500;
    }
    
    res.status(status).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {console.log(`Listening at http://localhost:${port}`)})

module.exports = app; //export the app to be used elsewhere