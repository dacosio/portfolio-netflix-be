const router = require("express").Router()
const List = require('../models/List')
const Movie = require('../models/Movie')
const tokenChecker = require('./tokenChecker')

router.post("/", tokenChecker, async (req, res)=> {
    if(req.user.isAdmin) {
        const newList = new List(req.body)
        try {
            const savedList = await newList.save()
            res.status(201).json(savedList)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(401).json("You are not allowed to add a list")
    }
})

router.delete("/:id", tokenChecker, async (req, res)=> {
    if(req.user.isAdmin) {
        try {
            await List.findByIdAndDelete(req.params.id)
            res.status(201).json("The list has been deleted")
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(401).json("You are not allowed to delete a list")
    }
})


router.get("/", tokenChecker, async (req, res)=> {
    const typeQuery = req.query.type
    const genreQuery = req.query.genre
    let list = [];
    try {
        if(typeQuery) {
            if(genreQuery) {
                list = await List.aggregate([
                    {$sample: { size: 10}},
                    { $match: { type: typeQuery, genre: genreQuery}}
                ])
            } else {
                list = await List.aggregate([
                    {$sample: { size: 10}},
                    { $match: { type: typeQuery}}
                ])
            }
        } else {
            list = await List.aggregate([{
                $sample: { size: 10}
            }])
        }
        res.status(201).json(list)
    } catch (error) {
        res.status(500).json(error)
    }
  
})



module.exports = router