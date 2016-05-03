var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
//temporary data store

module.exports = function(passport){
    var users = {};
    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user:',user.username);
        //return the unique id for the user
        done(null, user.username);
    });

    //Desieralize user will call with the unique id provided by serializeuser
    passport.deserializeUser(function(username, done) {

        return done(null, users[username]);

    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            var errMsg = "";
            if(users[username] == undefined){
                errMsg = 'User Not Found with username '+username;
                console.log(errMsg);
                return done(null, false, {message: errMsg});
            }

            if(isValidPassword(users[username], password)){
                //sucessfully authenticated
                return done(null, users[username]);
            }
            else{
                errMsg = 'Invalid password '+username;
                console.log(errMsg);
                return done(null, false, {message: errMsg})
            }
        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            var errMsg = "";
            if (users[username]){
                errMsg = 'User already exists with username: ' + username; 
                console.log(errMsg);
                return done(null, false, {message: errMsg});
            }
    
            //store user in memory 
            users[username] = {
                username: username,
                password: createHash(password)
            }

            errMsg = users[username].username + ' Registration successful';
            return done(null, users[username], {message: errMsg});
        })
    );
    
    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

};