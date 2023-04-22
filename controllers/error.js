exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not found',
        path: '/404',
        isAuthenticated: req.isLoggedIn
    })
}

exports.get500 = (req, res, next) => {
    res.status(500).render('500.ejs', {
        path: '/500',
        pageTitle: 'Error !!',
        isAuthenticated: req.isLoggedIn
    })
}