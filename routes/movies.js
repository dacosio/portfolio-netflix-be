const router = require("express").Router()
const Movie = require('../models/Movie')
const tokenChecker = require('./tokenChecker')

router.post("/", tokenChecker, async (req, res)=> {
    if(req.user.isAdmin) {
        const newMovie = new Movie(req.body)
        try {
            const savedMovie = await newMovie.save()
            res.status(201).json(savedMovie)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(401).json("You are not allowed to add a movie")
    }
})


router.put("/:id", tokenChecker, async (req, res)=> {
    if(req.user.isAdmin) {
        try {
            const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, {$set:rqe.body}, {new: true})
            res.status(200).json(updatedMovie)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(401).json("You are not allowed to update a movie")
    }
})


router.delete("/:id", tokenChecker, async (req, res)=> {
    if(req.user.isAdmin) {
        try {
            await Movie.findByIdAndDelete(req.params.id)
            res.status(200).json("The movie has been deleted")
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(401).json("You are not allowed to update a movie")
    }
})


router.get("/find/:id", tokenChecker, async (req, res)=> {
    try {
        const movie = await Movie.findById(req.params.id)
        res.status(200).json(movie)
    } catch (error) {
        res.status(500).json(error)
    }
})


// get random
router.get('/random', tokenChecker, async (req, res) => {
    const type = req.query.type
    let movie;
    try {
        if(type === 'series') {
            movie = await Movie.aggregate([
                { $match: {isSeries: true} },
                { $sample: { size: 1}},
            ])
        } else {
            movie = await Movie.aggregate([
                { $match: {isSeries: false} },
                { $sample: { size: 1}},
            ])
        }

        res.status(200).json(movie)
    } catch (error) {
        res.status(500).json(error)
    }
})


router.get("/", tokenChecker, async (req, res)=> {
    if(req.user.isAdmin) {
        try {
            const movies = await Movie.find()
            res.status(200).json(movies.reverse())
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(401).json("You are not allowed to update a movie")
    }
})

module.exports = router