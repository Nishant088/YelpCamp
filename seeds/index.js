const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
//We have double dot in path here since models is outside seeds
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

//we create shortform for mongoose.connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 180);
        const price = Math.floor(Math.random() * 20 + 10);
        const camp = new Campground({
            author: '6026f4eb63955f3a94f2d188',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/nishant444/image/upload/v1613505460/YelpCamp/dddve20hhdvvm03i1odr.jpg',
                    filename: 'YelpCamp/dddve20hhdvvm03i1odr'
                },
                {
                    url: 'https://res.cloudinary.com/nishant444/image/upload/v1613505460/YelpCamp/zslt5tarpnyin4g2xo60.jpg',
                    filename: 'YelpCamp/zslt5tarpnyin4g2xo60'
                }
            ],
            price: price,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime vitae tempora id, officia quo laudantium quisquam earum, delectus officiis iste itaque reprehenderit quas est non nihil pariatur adipisci, provident nulla.'
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})