const Category  = require('../models/Category');

// create tag handler
exports.createCategory = async (req,res)=>{
    try {
        // fetch data from request body
        const {name,description} = req.body;

        // validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required, please fill all fields'
            })
        }
        // create entry into Db
        const tagDetails = await Category.create({name:name,description:description},{new:true});
        console.log(tagDetails);

        // return response
        res.status(200).json({
            success:true,
            message:'Tag created successfully'
        })


    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
        
    }
}

// getAllTags handler
exports.showAllCategory = async (req,res)=>{
    try {
        const tags = await Category.find({},{name:true,description:true});
        return res.status(200).json(
            {
                success:true,
                message:'all tags returned successfully',
                tags,
            }
        )
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
        
    }
}