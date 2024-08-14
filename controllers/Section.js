const Course = require('../models/Course');
const Section = require('../models/Section');



// create Section
exports.createSection = async (req,res)=>{
    try {
        // fetch data from request body
        const {sectionName,courseId} = req.body;
        // validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing properties'
            })
        }
        // create entry into db
        const newSection = await Section.create({
            sectionName,
        });
        // update the section into Couse schema
        const updatedCourseDetail = await Course.findByIdAndUpdate({_id:courseId},{$push:{
            courseContent:newSection._id
        }},{new:true}).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            },
        })
        .exec(); //ToDo: explore about path syntax to populate
        // return response
        res.status(200).json({
            success:false,
            message:'Section created successfully',
            updatedCourseDetail,
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Something went wrong while creation of Section'
        }
        )
        
    }
}

// update section handler
exports.updateSection = async (req,res)=>{
    try {
        const {sectionName,sectionId} = req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'section name is missing to update'
            })
        }
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {sectionName,},
                {new:true});
        // return response
        res.status(200).json({
            success:false,
            message:'section Name updated successfully',
            updatedSection
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Something went wrong while Updattion of Section'
        })
        
    }
}

// delete section handler
exports.deleteSection = async (req,res)=>{
    try {
        // asuming getting sectionId from the request parameters
        const {sectionId} = req.params;
        // delete the section from Db
        await Section.findByIdAndDelete({sectionId});

        // return response
        res.status(200).json({
            success:true,
            message:'section deleted successfully'
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Something went wrong while deletion of Section'
        })
    }
}
