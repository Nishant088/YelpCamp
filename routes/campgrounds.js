const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
//we require storage from cloudinary/index
const { storage } = require('../cloudinary');
//now we want mutler to store files on the storage we create in cloudinary
const upload = multer({ storage });

router.get('/', catchAsync(campgrounds.index))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)
//place upload.array middleware before validateCampground as it parses the image
//and adds links of image in req.files but we need req.body in validate so we first
//create req.body and then validate
router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

// router.post('/', upload.array('image'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send("hi");
// })

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

router.put('/:id', isAuthor, isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))

router.get('/:id', catchAsync(campgrounds.showCampground))

router.delete('/:id', isAuthor, isLoggedIn, catchAsync(campgrounds.deleteCampground))

module.exports = router;