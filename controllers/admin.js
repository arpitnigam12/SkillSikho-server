import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from 'fs';
import { promisify } from "util";
import fs from 'fs';
import {User} from "../models/User.js"

export const createCourse= TryCatch(async (req, res) => {
    const { title, description, price, createdBy, category, duration } = req.body

    const image = req.file;

    await Courses.create({
        title,
        description,
        price,
        createdBy,
        category,
        image: image?.path,
        duration,
        
    })

    res.status(201).json({ message: 'Course created successfully' })
});

export const addLectures= TryCatch(async (req, res) => {
    const course = await Courses.findById(req.params.id)

    if(!course)
        return res.status(404).json({message: 'Course not found with this id'})
    const { title, description } = req.body

    const file = req.file
    const lecture = await Lecture.create({
        title,
        description,
        course: course._id,
        video: file?.path,

    });
    res.status(201).json({message: 'Lecture added successfully', lecture})
});

export const deleteLecture = TryCatch(async (req, res) => {
 const lecture = await Lecture.findById(req.params.id)

 rm(lecture.video, () => {

    console.log("video deleted")
 })

 await lecture.deleteOne();

 res.json({message: 'Lecture deleted successfully'})
})

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
           const course = await Courses.findById(req.params.id)

           const lectures = await Lecture.find({course: req.params.id})

         await Promise.all(
            lectures.map(async(lecture) => {
                await unlinkAsync(lecture.video)
                console.log("video deleted");
})
         );

            rm(course.image, () => {

    console.log("image deleted")
 })

 await Lecture.find({course: req.params.id}).deleteMany()
  await course.deleteOne();

  await User.updateMany({}, {$pull: {subscription: req.params.id}})

  res.json({message: 'Course deleted successfully'})

})

export const GetAllstats = TryCatch(async (req, res) => {

    const totalCourses = (await Courses.find()).length
    const totalLectures = (await Lecture.find()).length
    const totalUsers = (await User.find()).length;

    const  stats= {
        totalCourses,
        totalLectures,
        totalUsers
    }

    res.json({
        stats,
    })

})

export const getAllUser = TryCatch(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
  
    res.json({ users });
  });
  export const updateRole = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
  
    if (user.role === "user") {
      user.role = "admin";
      await user.save();
  
      return res.status(200).json({
        message: "Role updated to admin",
      });
    }
  
    if (user.role === "admin") {
      user.role = "user";
      await user.save();
  
      return res.status(200).json({
        message: "Role updated  User",
      });
    }
  });  