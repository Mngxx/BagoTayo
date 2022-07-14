if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { google } = require("googleapis");
const spreadsheetId = process.env.SPREADSHEET_ID;


const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});




const app = express();
app.use(express.static(__dirname + '/public'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

async function getData(sheet) {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: sheet,
    });
    var Rowdata = getRows.data.values;
    Rowdata.splice(0, 1);
    return Rowdata;
}

app.get('/', catchAsync(async (req, res, next) => {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    var get_temps = await googleSheets.spreadsheets.values.batchGet({
        auth,
        spreadsheetId,
        ranges: ["Videos", "Publications"],
    });
    var vids = get_temps.data.valueRanges[0].values;
    var pubs = get_temps.data.valueRanges[1].values;
    vids.splice(0, 1); pubs.splice(0, 1);
    for (let v of vids) {
        v.push("Videos")
    }
    for (let p of pubs) {
        p.push("Publications")
    }
    var arr = vids.concat(pubs)
    arr.sort().reverse();
    var numarr = 6;
    if (arr.length < 6) {
        numarr = arr.length
    }
    nav_hl = "home";
    res.render('bagotayo/index', { nav_hl, arr, numarr });
}))
app.get('/contact', (req, res, next) => {
    nav_hl = "contact";
    res.render('bagotayo/contact', { nav_hl });
})
app.post('/contact', catchAsync(async (req, res, next) => {
    nav_hl = "";
    const { name, email, pnum, msg } = req.body
    const client = await auth.getClient();
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    const googleSheets = google.sheets({ version: "v4", auth: client });
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Contact",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [["Unread",dateTime, name, email, pnum, msg]],
        },
    });
    res.render('bagotayo/formsubmitted', { nav_hl });
}))
app.get('/search', catchAsync(async (req, res, next) => {
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    var get_temps = await googleSheets.spreadsheets.values.batchGet({
        auth,
        spreadsheetId,
        ranges: ["Templates", "Videos", "Publications", "Other Materials"],
    });
    var temps = get_temps.data.valueRanges[0].values.sort().reverse();
    var vids = get_temps.data.valueRanges[1].values.sort().reverse();
    var pubs = get_temps.data.valueRanges[2].values.sort().reverse();
    var others = get_temps.data.valueRanges[3].values.sort().reverse();
    temps.splice(0, 1); vids.splice(0, 1); pubs.splice(0, 1); others.splice(0, 1);
    var data_q = {
        "Templates": temps,
        "Videos": vids,
        "Publications": pubs,
        "Other Materials": others,
    }
    nav_hl = ""
    var query = req.query.q;
    res.render('bagotayo/search', { nav_hl, query, data_q })
}))
app.get('/submitresource', (req, res, next) => {
    nav_hl = " ";
    res.render('bagotayo/submitresource', { nav_hl });
})
app.post('/submitresource', catchAsync(async (req, res, next) => {
    nav_hl = " ";
    const { name, email, num, org, categ, title, desc, link } = req.body;
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Submission of Resources",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [["Unread",dateTime, name, email, num, org, categ, title, desc, link]],
        },
    });
    res.render('bagotayo/formsubmitted', { nav_hl });
}))
app.get('/about', (req, res, next) => {
    nav_hl = "about";
    res.render('bagotayo/about', { nav_hl });
})
app.get('/resources/templates', catchAsync(async (req, res, next) => {
    nav_hl = "resources";
    var temps_data = await getData("Templates");
    var dict_temps = {}
    for (let i = 0; i < temps_data.length; i++) {
        if (temps_data[i][1] in dict_temps) {
            dict_temps[temps_data[i][1]].push([temps_data[i][2], temps_data[i][3]]);
        }
        else {
            dict_temps[temps_data[i][1]] = [[temps_data[i][2], temps_data[i][3]]];
        }
    }
    res.render('bagotayo/res_templates', { nav_hl, dict_temps });
}))
app.get('/resources/videos', catchAsync(async (req, res, next) => {
    nav_hl = "resources";
    var video_data = await getData("Videos");
    video_data.sort().reverse();
    res.render('bagotayo/res_videos', { nav_hl, video_data });
}))
app.get('/resources/publications', catchAsync(async (req, res, next) => {
    nav_hl = "resources";
    var pub_data = await getData("Publications");
    pub_data.sort().reverse();
    res.render('bagotayo/res_pub', { nav_hl, pub_data });
}))
app.get('/resources/othermaterials', catchAsync(async (req, res, next) => {
    nav_hl = "resources";
    var oth_data = await getData("Other Materials");
    oth_data.sort().reverse();
    res.render('bagotayo/res_others', { nav_hl, oth_data });
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
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})
