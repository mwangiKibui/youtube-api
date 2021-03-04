const express = require("express");

const app = express();

app.use(express.json());

app.use(express.urlencoded({extended:false}));

app.get("/",(req,res) => {


    let data = req.query;

    console.log("the code ",data)

    return res.send("<h1>You are now authenticated</h1>")

});

app.use('/doc',express.static('out'));

const PORT = process.env.PORT || 4000;

async function main(){

    await app.listen(PORT, () => {
        console.log(`🚀 http://localhost:${PORT}`)
    });

};

main()
.catch(console.log);