var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Users = mongoose.model('User');

module.exports = function(passport){
    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user:',user._id);
        //return the unique id for the user
        return done(null, user._id);
    });

    //Desieralize user will call with the unique id provided by serializeuser
    passport.deserializeUser(function(id, done) {
        Users.findById(id, function(err, user){
            if(err){
                return done(err, false, {message: 'db error'});
            }

            if(!user){
                return done('user not found', false)
            }

            return done(err, user);
        });

    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            var errMsg = "";
            Users.findOne({username: username}, function(err, user){
                if(err){
                    return done(err, false, {message: 'db error'});
                }

                if(!user){
                    errMsg = 'User Not Found with username '+username;
                    console.log(errMsg);
                    return done(null, false, {message: errMsg});
                }

                if(isValidPassword(user, password)){
                    //sucessfully authenticated
                    return done(null, user);
                }
                else{
                    errMsg = 'Invalid password '+username;
                    console.log(errMsg);
                    return done(null, false, {message: errMsg})
                }
            });
        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            var errMsg = "";
            Users.findOne({username: username}, function(err, user){
                if(err){
                    return done(err, false, {message: 'db error'});
                }

                if (user){
                    errMsg = 'User already exists with username: ' + username; 
                    console.log(errMsg);
                    return done(null, false, {message: errMsg});
                }

                var  new_user = new Users({
                    username: username,
                    password: createHash(password)
                })

                new_user.save(function(err){
                    if (err) {
                        return done(null, false, {message: 'db save error'});
                    } else {
                        errMsg = new_user.username + ' Registration successful';
                        return done(null, new_user, {message: errMsg});
                    }
                });
            });
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