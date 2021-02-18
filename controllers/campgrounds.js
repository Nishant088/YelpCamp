const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    //we use property geocoder.forwardGeocode to get the info about the location in 
    //query
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        //we set limit to 1 as we only want only one location realted to it
        limit: 1
    }).send()
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground);
    //we put Geojson date in our campground.geometry
    campground.geometry = geoData.body.features[0].geometry;
    //req.files now has a array that has info about the image
    //map will create a array of object that will only have a url and filename 
    //req.files now has images parsed using multer
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    //we put id of acc. that created this campground
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Created a new Campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    //populate allows to see the data of the object that is connected to the 
    //campground
    //we are doing a chaining of populate first we populate reviews on a campground
    //then we populate author on the review and then externally we populate author
    //of the campground
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}


module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    //req.files gives array
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    //we cant push a array in a already existing array therefore we spread
    //the req.files array and then push its elements
    campground.images.push(...imgs);
    //then we save it
    await campground.save();
    //deleting images if any
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            //we delete images from cloudinar
            await cloudinary.uploader.destroy(filename);
        }
        //we delete images from mongoDB
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Updated a Campground');
    res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted a Campground');
    res.redirect("/campgrounds");
}