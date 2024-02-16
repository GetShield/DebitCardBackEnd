const userRoutes = require('./user.route')
const walletRoutes = require('./wallet.route')

exports.init = function (app) {
    app.use('/api/users', userRoutes)
    app.use('/api/wallets', walletRoutes)
}