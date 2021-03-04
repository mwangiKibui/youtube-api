const fs = require("fs");
const readline = require("readline");
const {google} = require("googleapis");
const OAuth2 = google.auth.OAuth2;

//If modifying these scopes, delete your previously saved credentials.

let scopes = ['https://www.googleapis.com/auth/youtube.readonly'];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/credentials';

let TOKEN_PATH = `${TOKEN_DIR}/youtube-nodejs-quickstart.json`;

//Load client secrets from a local file.
fs.readFile('./client_secret.json',(err,content) => {

    if(err){
        console.log("Error loading client secret file" + err);
        return ;
    };


    //Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content),getChannel);
});

/**
 * 
 * Create an Oauth2 client with the given credentials
 * execute the callback function
 * 
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

function authorize(credentials,callback) {

    let clientSecret = credentials.web.client_secret;
    let clientId  = credentials.web.client_id;
    let redirectUrl = credentials.web.redirect_uris[0];
    let oauth2Client = new OAuth2(clientId,clientSecret,redirectUrl);

    //Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH,(err,token) => {

        //check if there is not, there is an error.
        if(err){
            getNewToken(oauth2Client,callback)
        } else {
            //we set the credentials.

            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }

    })

};

/**
 * Get and store the new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * 
 * @param {google.auth.OAuth2} oauth2Client. The OAuth2 client to get token from.
 * @param {getEventsCallback} callback. The callback to call with the authorized client.
 * 
 */

function getNewToken(oauth2Client,callback){

    let authUrl = oauth2Client.generateAuthUrl({
        access_type:"offline",
        scope:scopes
    });

    console.log("Authorize this app by visiting this url",authUrl);

    //the prompt

    let r1 = readline.createInterface({
        input:process.stdin,
        output:process.stdout
    });

    r1.question('Enter the code from that page here', code => {
        r1.close();
        oauth2Client.getToken(code,(err,token) => {

            //check for error.
            if(err) {
                console.log("Error while trying to retrieve access token", err);
                return;
            };

            //set the credentials

            oauth2Client.credentials = token;

            //store the token

            storeToken(token);

            //call the callback

            callback(oauth2Client);

        })
    })
};

/**
 * Store token to disk to be used in later program executions.
 * 
 * @param {Object} token. The token to store to disk.
 */

 function storeToken(token){

    try {

        //make a dir

        fs.mkdirSync(TOKEN_DIR);

    }catch(err) {

        //if the error is code about the dir existing,

        if(err.code !== 'EEXIST'){;

        throw err;

        };
    };
    
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {

        if(err) throw err;

        console.log(`Token stored to ${TOKEN_PATH}`)

    })
 };

/**
 * 
 * Lists the names and IDs of up to 10 files.
 * 
 * @param {google.auth.OAuth2} auth. An authorized OAuth2 client.
 */

function getChannel(auth){

    let service = google.youtube('v3');

    service.channels.list({
        auth:auth,
        part:'snippet,contentDetails,statistics',
        forUsername:'GoogleDevelopers'
    }, (error,response) => {

        if(error) {
            console.log("The API returned an error ",error);
            return;
        };

        let channels = response.data.items;

        if(channels.length === 0) {

            console.log("No channel found");

        }else  {
            
            console.log('This channel\'s ID is %s. Its title is \'%s\' and it has %s views.',
            channels[0].id,
            channels[0].snippet.title,
            channels[0].statistics.viewCount
            );


        }

    })
}