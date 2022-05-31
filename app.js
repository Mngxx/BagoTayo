const express = require('express');
const path = require('path')
const ejsMate = require('ejs-mate')
const Joi = require('joi');
const methodOverride = require('method-override');



const app = express();
//Static Files
app.use(express.static('public'));
app.use('/css',express.static(__dirname + 'public/css'))
app.use('/js',express.static(__dirname + 'public/js'))
app.use('/img',express.static(__dirname + 'public/img'))

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('bagotayo/index');
})
app.listen(3000, () => {
    console.log("Serving on port 3000");
})