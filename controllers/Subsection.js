const Subsection = require('../models/SubSection');
const Section = require('../models/SubSection');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
require('dotenv').config();


// create sub-section handler
exports.createSubsection = async (req,res)=>{
    try {
        // fetch data from request body
        const {title,description,timeDuration,sectionId} = req.body;
        // extract media data from request files
        const video = req.files.videoFile;
        // validation
        if(!title || !description || !timeDuration || !video || !sectionId){
            return res.status(400).json({
                success:false,
                message:'All field are required'
            })
        }
        // upload media to media server
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        // create entry into Db
        const subSectionDetails = await Subsection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url
        });

        // update Subsection into Section schema
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                subSection:subSectionDetails._id,
            }
        },{new:true}); // ToDo: populate the sectoin

        res.status(200).json({
            success:true,
            message:'Subsection created successfully',
            updatedSection,
        })


        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Something went wrong while creation of Subsection'
        })
        
    }
}

// update sub-section handler
exports.updateSubsection = async (req,res) =>{
    try {
        const {title,description,timeDuration,subsectionId} = req.body;
        const video = req.file.videoFile; 

        // upload media to cloudinary
        const uploadedImage= await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        // update into Db
        const updatedSubsection = await Subsection.findByIdAndUpdate({_id:subsectionId},{
            title:title,
            description:description,
            timeDuration:timeDuration,
            videoUrl:uploadedImage.secure_url,
        });

        // return response
        res.status(200).json({
            success:true,
            message:'Subsection updated successfully'
        })
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Something went wrong while updation of Subsection'
        })
    }
}

// delete sub-section handler
exports.deleteSubsection = async (req,res)=>{
    try {
        const {subsectionId} = req.params;
        await Subsection.findByIdAndDelete({_id:subsectionId});
        res.status(200).json({
            success:true,
            message:'subsection deleted successfully'
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Something went wrong while deletion of Subsection'
        })
        
    }
}