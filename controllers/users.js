const User = require('../models/user');

const checker=function(value) {
    return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) // allowed characters

         && /[a-z]/.test(value) // contains lowercase
         && /[A-Z]/.test(value) // contains UPPERCASE
         && /[0-9]/.test(value) // contains Number
         && /[!@#$%^&*.]/.test(value) // contains specialCharacter
}


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
       if(checker(password))
       {
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
       }
       else{
        req.flash('error', 'Password must have lowecase uppercase and numbers and special characters');
        res.redirect('/register');
       }
        
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

