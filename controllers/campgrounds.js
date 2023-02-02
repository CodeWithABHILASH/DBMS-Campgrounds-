const Campground = require('../models/campground');
const Book = require('../models/book');
const User = require('../models/user');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const utility=function(a){
 const s1=new String(a.EntryDate)
    const s2=new String(a.ExitDate)
    const st=new Date(s1.substring(0,10));
    const et=new Date(s2.substring(0,10));
    const stms=st.getTime()
    const etms=et.getTime()
    const tg=etms-stms;
    const aDay=24*60*60*1000;
    const sp=Math.round(tg/aDay);
    console.log(sp)
    return sp;
}
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    
    
    const campground = new Campground(req.body.campground);
    campground.geometry=geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res,) => {
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
    res.render('campgrounds/show', { campground });
}

module.exports.showBook = async (req, res,) => {
    const campground = await Campground.findById(req.params.id);
   res.render('book.ejs',{campground})
}
module.exports.confirmBook = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const book = await Book.findById(req.params.bid);
    const user = await User.findById(book.userid);
   
    res.render('book1.ejs',{campground,book,user})
 }
module.exports.Book = async (req, res,) => {
    let date= Date.now();
    console.log(date)
    
    if(req.body.EntryDate>req.body.ExitDate )
    {
        req.flash('error', 'improper date format!');
        res.redirect('book')
    }else if(new Date(date)>new Date(req.body.EntryDate))
    {
        req.flash('error', 'improper date format!');
        res.redirect('book')
    }
    else {

    const campground = await Campground.findById(req.params.id);
   let sp=utility(req.body)
    const bill=req.body.TotalBill*(campground.price)*sp;
    const book = new Book({
        campid:req.params.id,
        userid: req.user._id,
        EntryDate:req.body.EntryDate,
        ExitDate:req.body.ExitDate,
        TotalBill:bill
    });
   
    await book.save();
    req.flash('success', 'Successfully booked a campground!');
    res.redirect(`${book._id}/confirmBook`)
}
 }

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}