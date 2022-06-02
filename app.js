const express = require('express');
const path = require('path')
const ejsMate = require('ejs-mate')
const Joi = require('joi');
const methodOverride = require('method-override');



const app = express();
//Static Files
app.use(express.static(__dirname + '/public'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    nav_hl = "home";
    res.render('bagotayo/index', { nav_hl });
})
app.get('/contact', (req, res) => {
    nav_hl = "contact";
    res.render('bagotayo/contact', { nav_hl });
})
app.get('/forum', (req, res) => {
    nav_hl = "forum";
    res.render('bagotayo/forum', { nav_hl });
})
app.get('/about', (req, res) => {
    nav_hl = "about";
    res.render('bagotayo/about', { nav_hl });
})
app.get('/resources/templates', (req, res) => {
    nav_hl = "resources";
    res.render('bagotayo/res_templates', { nav_hl });
})
app.get('/resources/videos', (req, res) => {
    nav_hl = "resources";
    res.render('bagotayo/res_videos', { nav_hl });
})
app.get('/resources/publications', (req, res) => {
    nav_hl = "resources";
    res.render('bagotayo/res_pub', { nav_hl });
})
app.listen(3000, () => {
    console.log("Serving on port 3000");
})
