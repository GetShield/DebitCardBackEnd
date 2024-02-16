const userRoutes = require('./user.route')

exports.init = function (app) {
    app.use('/api/users', userRoutes)
}