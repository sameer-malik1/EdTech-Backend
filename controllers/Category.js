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
        const categoryDetails = await Category.create({name:name,description:description},{new:true});
        console.log(categoryDetails);

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
exports.showAllCategories = async (req,res)=>{
    try {
        const allCategory = await Category.find({},{name:true,description:true});
        return res.status(200).json(
            {
                success:true,
                message:'All Categories returned successfully',
                date:allCategory,
            }
        )
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
        
    }
}

exports.categoryPageDetails = async (req,res)=>{
    try {
        const {categoryId} = req.body;

        // get Courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .pupulate('courses').exec();
        console.log("selected Category",selectedCategory);
        // hadle the case when the category is not found
        if(!selectedCategory){
            console.log('Selected Category not found');
            return res.status(404).json({
                success:false,message:'Category not found'
            })
        }
        // handle the case when there are no courses
        if(selectedCategory.courses.length === 0){
            console.log("NO courses found for the selected Category");
            return res.status(404).json({
                success:false,
                message:'No courss fount for the selected Category'
            })
        }
         
        const selectedCourses = selectedCategory.courses;

        // get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id:{$ne: categoryId},
        }).populate("courses");
        
        let differentCourses = [];
        for(const category of categoriesExceptSelected){
            differentCourses.push(...category.courses);
        }

        // get the Top-selling courses across the categories
        const allCategories = await Category.find().populate('courses');
        const allCourses = allCategories.flatMap((category)=>category.courses);
        const mostSellingCourses = allCourses.sort((a,b)=>b.sold = a.sold).slice(0,10);

        res.status(200).json({
            selectedCourses:selectedCourses,
            differentCourses:differentCourses,
            mostSellingCourses: mostSellingCourses,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:'Internal Server Error',
            error:error.message,
        })
        
    }
}