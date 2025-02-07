const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000


app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/auth/login.html', function(req, res){
    res.sendFile(path.join(__dirname, 'public', 'auth',  'login.html' ))
})



app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
})