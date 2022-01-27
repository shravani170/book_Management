const reviewModel = require('../model/reviewModel')
const bookModel = require('../model/bookModel')
const mongoose = require('mongoose');

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = function (ObjectId) {
    return Object.keys(ObjectId).length > 0
}
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

//POST /books/:bookId/review

const reviewData = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const reviewbody = req.body
        if (!isValidRequestBody(reviewbody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide reviewer details' });
            return;
        }
        if (!isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: 'You Are Providing Invalid bookId' });
            return;
        }
        const { reviewedBy, rating, review } = reviewbody;

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!book) {
            return res.status(404).send({ status: false, message: 'book does not exist' });
        }
        if (reviewedBy) {
            if (!isValid(reviewedBy)) {
                res.status(400).send({ status: false, message: 'reviewedBy  is required' });
                return;
            }
        }
        if (reviewedBy === "") { return res.status(404).send({ status: false, messege: "Please provide The Name" }) }
        if (!isValid(rating)) {
            res.status(400).send({ status: false, message: 'rating  is required' });
            return;
        }
        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: false, messege: "Rating Value Should Be In Between 1 to 5" })
        }
        if (review) {
            if (!isValid(review)) {
                res.status(400).send({ status: false, message: 'Provide The Review' });
                return;
            }
        }
        if (review === "") { return res.status(404).send({ status: false, messege: "Please provide Your Review" }) }
        const reviewedAt = new Date();
        let reviewData = { bookId, reviewedBy, reviewedAt, rating, review };
        reviewData = await reviewModel.create(reviewData)

        let checker = await reviewModel.find({ bookId: bookId, isDeleted: false });
        let number = checker.length

        await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { reviews: number })

        return res.status(201).send({ status: true, message: 'Success', data: reviewData })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }

}

//PUT /books/:bookId/review/:reviewId

const updateReview = async function (req, res) {
    try {
        let body = req.body
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        if (!isValid(bookId)) {
            return res.status(400).send({ messege: "Please provide The Id Properly" })
        }
        if (!isValid(reviewId)) {
            return res.status(400).send({ messege: "Please provide The Id Properly" })
        }
        if (!isValidRequestBody(body)) {
            return res.status(400).send({ messege: "Please Provide The Required Field" })
        }
        if (!isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: 'You Are Providing Invalid bookId' });
            return;
        }
        if (!isValidObjectId(reviewId)) {
            res.status(400).send({ status: false, message: 'You Are Providing Invalid reviewId' });
            return;
        }
        const { reviewedBy, review, rating } = body
        if (reviewedBy) {
            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, messege: "Please provide The Name" })
            }
        }
        if (reviewedBy === "") { return res.status(404).send({ status: false, messege: "Please provide The Name" }) }
        if (review) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, messege: "Please Provide Your Review" })
            }
        }
        if (review === "") { return res.status(404).send({ status: false, messege: "Please provide The Review" }) }
        if (rating) {
            if (!isValid(rating)) {
                return res.status(400).send({ status: false, messege: "Please Provide Your Rating" })
            }
            if (!(rating >= 1 && rating <= 5)) {
                return res.status(400).send({ status: false, messege: "Rating Value Should Be In Between 1 to 5" })
            }
        }

        let find = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!find) {
            return res.status(404).send({ messege: "The Book Doesn't Exist In Our Data" })
        }
        let check = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!check) {
            return res.status(404).send({ status: false, messege: "The Review Data Doesn't Exist" })
        }
        if (find && check) {
            let equal = check.bookId
            if (equal == bookId) {
                const updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { reviewedBy: reviewedBy, review: review, rating: rating }, { new: true }).select({ __v: 0 })
                return res.status(200).send({ status: true, message: 'Review updated successfully', data: updatedReview });
            }
            else {
                return res.status(400).send({ status: false, messege: "You Are Not Allowed To Update This" })
            }
        } else {
            return res.status(404).send({ status: false, messege: "Cant Find What You Are Looking For" })
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


//DELETE /books/:bookId/review/:reviewId

const reviewDelete = async function (req, res) {
    try {
        const reviewId = req.params.reviewId
        if (!isValidObjectId(reviewId)) {
            res.status(404).send({ status: false, message: `${reviewId} is not a valid review id` })
            return
        }
        if (!isValid(reviewId)) {
            return res.status(400).send({ messege: "Please Provide The review id" })
        }


        const bookID = req.params.bookId
        if (!isValidObjectId(bookID)) {
            res.status(404).send({ status: false, message: `${bookID} is not a valid book id` })
            return
        }
        if (!isValid(bookID)) {
            return res.status(400).send({ messege: "Please Provide The bookId" })
        }


        let findbook = await bookModel.findOne({ _id: bookID, isDeleted: false })
        if (!findbook) {
            return res.status(404).send({ message: "Currently Their Is No booK" })
        }
        let findreview = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!findreview) {
            return res.status(404).send({ message: "Currently Their Is No review" })
        }
        if (findbook && findreview) {
            let ID = findreview.bookId
            if (ID == bookID) {
                const deleteReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { isDeleted: true }, { new: true })
                let checker1 = await reviewModel.find({ bookId: bookID, isDeleted: false });
                let number1 = checker1.length
                await bookModel.findOneAndUpdate({ _id: bookID, isDeleted: false }, { reviews: number1 })
                return res.status(200).send({ status: true, message: 'Review deleted successfully', data: deleteReview });
            }
            else {
                return res.status(400).send({ status: false, messege: "You Are Not Allowed To Delete This" })
            }
        } else {
            return res.status(404).send({ status: false, messege: "Cant Find What You Are Looking For" })
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}




module.exports.reviewData = reviewData
module.exports.updateReview = updateReview
module.exports.reviewDelete = reviewDelete