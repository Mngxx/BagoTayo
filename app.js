const express = require('express');
const path = require('path')
const ejsMate = require('ejs-mate')
const Joi = require('joi');
const { contactSchema } = require('./joi_schemas')
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

const {google} = require("googleapis");
const spreadsheetId = "1iJGfuIR6TjAD74CbqdgBcd2RPqMw02b0zitzj_JbOXY";
const auth = new google.auth.GoogleAuth({
    keyFile:"credentials.json",
    scopes:"https://www.googleapis.com/auth/spreadsheets",
});



const app = express();
//Static Files
app.use(express.static(__dirname + '/public'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

async function getData(sheet){
    const client = await auth.getClient();
    const googleSheets = google.sheets({version:"v4",auth:client});
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range:sheet,
    });
    var Rowdata = getRows.data.values;
    Rowdata.splice(0,1);
    return Rowdata;
}

const validateContact = (req,res,next) =>{
    const {error} = contactSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

app.get('/', catchAsync(async(req, res ,next) => {
    nav_hl = "home";
    var video_data = await getData("Videos");
    res.render('bagotayo/index', { nav_hl,video_data});
}))
app.get('/contact', (req, res ,next) => {
    nav_hl = "contact";
    res.render('bagotayo/contact', { nav_hl });
})
app.post('/contact', validateContact, catchAsync(async(req,res ,next)=>{
    nav_hl = "";
    const {name,email,pnum,msg} = req.body
    const client = await auth.getClient();
    const googleSheets = google.sheets({version:"v4",auth:client});
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range:"Contact",
        valueInputOption:"USER_ENTERED",
        resource:{
            values:[[name,email,pnum,msg]],
        },
    });
    res.render('bagotayo/contactsubmitted', {nav_hl});
}))
app.get('/forum', (req, res ,next) => {
    nav_hl = "forum";
    res.render('bagotayo/forum', { nav_hl });
})
app.get('/about', (req, res ,next) => {
    nav_hl = "about";
    res.render('bagotayo/about', { nav_hl });
})
app.get('/resources/templates', catchAsync(async(req, res ,next) => {
    nav_hl = "resources";
    var temps_data = await getData("Templates");
    var dict_temps = {}
    for(let i=0;i<temps_data.length;i++){
        if(temps_data[i][0] in dict_temps){
            dict_temps[temps_data[i][0]].push([temps_data[i][1],temps_data[i][2]]);
        }
        else{
            dict_temps[temps_data[i][0]] = [[temps_data[i][1],temps_data[i][2]]];
        }
    }
    res.render('bagotayo/res_templates', { nav_hl, dict_temps });
}))
app.get('/resources/videos', catchAsync(async(req, res ,next) => {
    nav_hl = "resources";
    var video_data = await getData("Videos");
    res.render('bagotayo/res_videos', { nav_hl,video_data });
}))
app.get('/resources/publications', catchAsync(async(req, res ,next) => {
    nav_hl = "resources";
    var pub_data = await getData("Publications");
    res.render('bagotayo/res_pub', { nav_hl,pub_data });
}))
app.get('/resources/othermaterials', catchAsync(async(req, res ,next) => {
    nav_hl = "resources";
    var oth_data = await getData("Other Materials");
    res.render('bagotayo/res_others', { nav_hl, oth_data});
}))
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})
app.use((err, req, res, next) => {
    nav_hl = ""
    const { message = "Something went wrong", statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No!, Something Went Wrong!";
    res.status(statusCode).render('bagotayo/error', { err, nav_hl });
})
app.listen(3000, () => {
    console.log("Serving on port 3000");
})
