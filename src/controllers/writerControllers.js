const writerModel = require('../model/writerModel')
const jwt = require("jsonwebtoken")

//USING VALIDATION
const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true;
}
const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0
}


//POST /register

const createWriter = async function (req, res) {
  try {

    let writer = req.body
    if (!isValidRequestBody(writer)) {
      res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide writer details' });
      return;
    }
    const { title, name, phone, email, password, address } = writer
    const isUserAlreadyExist = await writerModel.findOne({ phone: phone, email: email, password: password });
    if (isUserAlreadyExist) {
      return res.status(403).send({ status: false, message: 'writer  already  exist' });
    }
    const samePhone = await writerModel.findOne({ phone: phone });
    if (samePhone) {
      return res.status(403).send({ status: false, message: `${phone} is already in used` });
    }
    const sameEmail = await writerModel.findOne({ email: email });
    if (sameEmail) {
      return res.status(403).send({ status: false, message: `${email} is already in used` });
    }
    if (!isValid(title)) {
      res.status(400).send({ status: false, message: 'Title  is required' });
      return;
    }

    if (!isValid(name)) {
      res.status(400).send({ status: false, message: 'Name is required' });
      return;
    }
    if (!isValid(phone)) {
      res.status(400).send({ status: false, message: `Phone number is required` });
      return;
    }
    if (!isValid(email)) {
      res.status(400).send({ status: false, message: `Email is required` });
      return;
    }
    if (!isValid(password)) {
      res.status(400).send({ status: false, message: `password is required` });
      return;
    }
    if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password))) {
      res.status(400).send({ status: false, message: `Password length should be A Valid Password And Length Should Be in between 8 to 15 ` });
      return;
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
      res.status(400).send({ status: false, message: `${email} should be a valid email address` })
      return
    }
    if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
      res.status(400).send({ status: false, message: `${phone} is not a valid number` })
      return
    }
    let TrimTitle = title.trim()
    if (!(TrimTitle == "Mr" || TrimTitle == "Mrs" || TrimTitle == "Miss")) {
      return res.status(400).send({ status: false, message: "Title can Only Contain Mr,Mrs,Miss" })
    }

    let savedWriter = await writerModel.create(writer);
    return res.status(201).send({ status: true, message: 'Success', data: savedWriter });

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}





//POST /login

const login = async function (req, res) {
  try {
    const credential = req.body
    if (!isValidRequestBody(credential)) {
      return res.status(400).send({ status: false, messege: "please provide the required field" })
    }
    const { email, password } = credential;
    if (!isValid(email)) {
      return res.status(400).send({ status: false, message: "please provide the email field" })
    }
    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "please provide the password field" })
    }
    if (email && password) {
      let User = await writerModel.findOne({ email: email.trim().toLowerCase(), password: password.trim() });
      if (User) {
        const Token = jwt.sign({ userId: User._id }, "login", { expiresIn: "24h" })
        res.header('x-api-key', Token)
        res.status(200).send({ status: true, messege: "You Have Successfully Logged In" })
        return;
      } else {
        return res.status(404).send({ status: false, messege: "Invalid Credential" })
      }

    }


  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}
















module.exports.createWriter = createWriter
module.exports.login = login