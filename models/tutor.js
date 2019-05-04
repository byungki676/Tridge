var mongoose = require("mongoose");
var util = require("../util");

// schema
var TutorSchema = mongoose.Schema({
   img: {
      type: String
   },
   info: {
      type: String,
      //required: [true, "info is required!"]
   },
    title: {
        type: String,
        //required: [true, "info is required!"]
    },
    aboutMentor: {
        type: String,
        //required: [true, "info is required!"]
    },
    studyDetail: {
        type: String,
        //required: [true, "info is required!"]
    },
   
   // 스터디 개설자
   name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      //required: true
   },

   // 참여한 사람
   participateUser: [],
   
   // input 타입 정의하기.
   field: {
      type: String,
      //required: [true, "field is required!"]
   },
   
   location: {
      type: String,
      //required: [true, "location is required!"]
   },
   date: {
      type: String,
      //required: [true, "date is required!"]
   },
   
   time: {
      type: String
   },
   startdate: {
        type: String
   },

   createdAt: {
      type: Date,
      default: Date.now
   },
   updatedAt: {
      type: Date
   },
}, {
   toObject: {
      virtuals: true
   }
});

// virtuals
TutorSchema.virtual("createdDate")
   .get(function () {
      return util.getDate(this.createdAt);
   });

TutorSchema.virtual("createdTime")
   .get(function () {
      return util.getTime(this.createdAt);
   });

TutorSchema.virtual("updatedDate")
   .get(function () {
      return util.getDate(this.updatedAt);
   });

TutorSchema.virtual("updatedTime")
   .get(function () {
      return util.getTime(this.updatedAt);
   });

// model & export
var Tutor = mongoose.model("tutor", TutorSchema);
module.exports = Tutor;