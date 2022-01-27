const bookModel = require('../model/bookModel');
const writerModel = require('../model/writerModel');
const mongoose = require('mongoose');
const moment = require('moment');
const reviewModel = require('../model/reviewModel');
const { reviewData } = require('./reviewController');

//USING VALIDATION
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)

}

//POST /books

const createBook = async function (req, res) {
    try {

        let book = req.body
        let userId = req.user.userId
        if (!isValidRequestBody(book)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide writer details' });
            return;
        }
        const { title, excerpt, ISBN, category, subCategory } = book
        const isBookAlreadyExist = await bookModel.findOne({ title: title, ISBN: ISBN, isDeleted: false });
        if (isBookAlreadyExist) {
            return res.status(403).send({ status: false, message: 'Book  already  exist' });
        }
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: 'Title  is required' });
            return;
        }

        if (!isValid(excerpt)) {
            res.status(400).send({ status: false, message: 'Excerpt is required' });
            return;
        }
        if (!isValid(ISBN)) {
            res.status(400).send({ status: false, message: `ISBN is required` });
            return;
        }
        if (!isValid(category)) {
            res.status(400).send({ status: false, message: `category is required` });
            return;
        }
        if (!isValid(subCategory)) {
            res.status(400).send({ status: false, message: `subCategory is required` });
            return;
        }
        const sameTitle = await bookModel.findOne({ title: title.trim(), isDeleted: false });
        if (sameTitle) {
            return res.status(403).send({ status: false, message: `${title} is already in used` });
        }
        const sameISBN = await bookModel.findOne({ ISBN: ISBN.split(" ").join(""), isDeleted: false });
        if (sameISBN) {
            return res.status(403).send({ status: false, message: `${ISBN.split(" ").join("")} is already in used` });
        }

        let object = { title, excerpt, ISBN, category, subCategory, userId }

        object["releasedAt"] = moment().format("MMM Do YY");
        object["ISBN"] = ISBN.split(" ").join("");
        let savedBook = await bookModel.create(object);
        return res.status(201).send({ status: true, message: 'Success', data: savedBook });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}



//GET /books
const getBook = async function (req, res) {

    try {
        let updatedfilter = { isDeleted: false }
        if (req.query.userId) {
            if (!isValidObjectId(req.query.userId)) {
                res.status(400).send({ status: false, message: `Userid is Invalid` });
                return;
            }
            if (!isValid(req.query.userId)) {
                res.status(400).send({ status: false, message: `Userid is Invalid` });
                return;
            }
            updatedfilter["userId"] = req.query.userId
        }
        if (req.query.category) {
            if (!isValid(req.query.category)) {
                res.status(400).send({ status: false, message: `Category is Invalid` });
                return;
            }
            updatedfilter["category"] = (req.query.category).toLowerCase().trim()
        }
        if (req.query.subCategory) {
            if (!isValid(req.query.subCategory)) {
                res.status(400).send({ status: false, message: `subCategory is Invalid` });
                return;
            }
            updatedfilter["subCategory"] = (req.query.subCategory).toLowerCase().trim()
        }
        let check = await bookModel.find(updatedfilter).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, subCategory: 1, releasedAt: 1, reviews: 1 }).sort({title:1})
        if (check.length > 0) {
            // check.sort(function (a, b) {
               
            //     if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
            //     if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
                
            // })
            return res.status(200).send({ status: true, messege: "Book List", data: check })
        }
        else {
            return res.status(404).send({ messege: "Cant Find What You Are Looking For" })
        }

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


//GET /books/:bookId

const findBook = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, messege: "Please Use A Valid Link" })
        }
        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, messege: "Please Use A Valid Link" })
        }
        let findbook = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ __v: 0 })
        if (findbook) {
            let { title, excerpt, userId, category, subcategory, isDeleted, reviews, deletedAt, releasedAt, createdAt, updatedAt } = findbook

            let reviewsData = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ createdAt: 0, updatedAt: 0, __v: 0 });

            const data = { title, excerpt, userId, category, subcategory, isDeleted, reviews, deletedAt, releasedAt, createdAt, updatedAt, reviewsData }

            data["reviews"] = data["reviewsData"].length
            return res.status(200).send({ status: true, messege: "Book List", Data: data })

        } else {
            return res.status(404).send({ status: false, messege: "Cant Find What You Are Looking For" })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


//PUT /books/:bookId

const updateBook = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if (!isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: `bookid is Invalid` });
            return;
        }
        let title = req.body.title
        let excerpt = req.body.excerpt
        let ISBN = req.body.ISBN
        let releasedate = req.body.releasedate
        if (!isValid(bookId)) {
            return res.status(400).send({ messege: "Please Provide The Book Id" })
        }

        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ messege: "Please Provide The Required Field" })
        }

        if (title) {
            if (!isValid(title)) {
                return res.status(400).send({ messege: "Please Provide The Valid Title" })
            }
            const sametitle = await bookModel.findOne({ title: title.trim(), isDeleted: false });
            if (sametitle) {
                return res.status(403).send({ status: false, message: `${title.trim()} is already in used` });
            }
            title = title.trim();
        }
        if (title === "") { return res.status(400).send({ status: false, messege: "Provide The Title" }) }
        if (excerpt) {
            if (!isValid(excerpt)) {
                return res.status(400).send({ messege: "Please Provide The Valid Excerpt" })
            }
        }
        if (excerpt === "") { return res.status(400).send({ status: false, messege: "Provide The Excerpt" }) }
        if (ISBN) {

            if (!isValid(ISBN)) {
                return res.status(400).send({ status: false, messege: "Please Provide The Valid ISBN" })
            }
            const SameISBN = await bookModel.findOne({ ISBN: ISBN.split(" ").join(""), isDeleted: false });
            if (SameISBN) {
                return res.status(403).send({ status: false, message: `${ISBN.split(" ").join("")} is already in used` });
            }
            ISBN = ISBN.split(" ").join("");

        }
        if (ISBN === "") { return res.status(400).send({ status: false, messege: "Provide The ISBN" }) }
        if (releasedate) {
            if (!isValid(releasedate)) {
                return res.status(400).send({ messege: "Please Provide The Valid Date" })
            }
        }
        if (releasedate === "") { return res.status(400).send({ status: false, messege: "Provide The Release Date" }) }

        const check = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!check) {
            return res.status(404).send({ status: false, msg: "Currently There Is No Book" })
        }
        let id = check.userId

        if (req.user.userId == id) {
            let findid1 = await writerModel.findOne({ id })
            if (!findid1) {
                return res.status(404).send({ status: false, messege: "Can't Find The Writer" })
            }
            const updatedBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { title: title, excerpt: excerpt, ISBN: ISBN, releasedAt: releasedate }, { new: true })

            return res.status(200).send({ status: true, message: 'Book updated successfully', data: updatedBook });
        } else {
            return res.status(404).send({ msg: "You Are Not Authorised To Update This" })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


//DELETE /books/:bookId

const deleteBook = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if (!isValid(bookId)) {
            return res.status(400).send({ messege: "Please Provide The bookId" })
        }
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ messege: "Please Provide Valid ObjectId" })
        }
        let findbook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!findbook) {
            return res.status(400).send({ message: "Currently Their Is No booK" })
        }
        let id = findbook.userId
        if (req.user.userId == id) {
            let findid2 = await writerModel.findOne({ id })
            if (!findid2) {
                return res.status(404).send({ status: false, messege: "Cant Find The Writer" })
            }
            let deletedbook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })
            if (deletedbook) {
                return res.status(200).send({ status: true, messege: "Book Deleted Successfully", data: deletedbook })
            }

            else {
                return res.status(404).send({ msg: "Book Has Been Already Deleted" })
            }
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}















module.exports.createBook = createBook
module.exports.getBook = getBook
module.exports.findBook = findBook
module.exports.updateBook = updateBook
module.exports.deleteBook = deleteBook