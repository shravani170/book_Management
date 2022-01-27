const jwt = require("jsonwebtoken")

const Auth = async function (req, res, next) {
    try {

        let token = req.headers['x-api-key']
        if (!token) {
             return res.status(401).send({ status: false, Message: 'You Are Not Logged In' })
        } else {
            let decodedtoken = jwt.verify(token, 'login')
            if (decodedtoken) {
                req.user = decodedtoken
                next()
            } else {
               return res.status(401).send({ Message: "Authentication Token is missing/Expired" })
            }
        }
    }
    catch (error) {
      return  res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.Auth = Auth