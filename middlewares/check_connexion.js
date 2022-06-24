
module.exports = {
    
    checkIfUserIsConnected: (req, res, next) => {
        if (req.session.userInfos) {
            next()
        } else
        //    res.redirect("/access_denied")
        res.redirect('/login');

    },
    
    checkIfUserIsNotConnected: (req, res, next) => {
        if (!req.session.userInfos) {
            next()
        } else
            res.redirect("/")
    }
}

