const { number } = require('joi');
const Review = require('./review')
const User = require("./users");
const mongoose = require('mongoose');

//we create shortform for mongoose.Schema
const Schema = mongoose.Schema;

//we create a new imageschema for images as we want to add virtual propert in it 
//therefore it should be a schema
const ImageSchema = new Schema({
    url: String,
    filename: String
});

//we add virtual property as thumbnail
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

//using this line our virtuals will now be a part of campground instance
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    //we create a array of instances of imageschemas
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts) //we now need to pass opts to it to include all virtuals in it

//we create a virtual for popup, we need this to be named after properties. to make
//it work with or map cluster
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});


CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);