var express  = require("express");
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var util     = require("../util");
var Tutor = require("../models/tutor");
var User = require("../models/User");

// multer
var storage = multer.diskStorage({

    destination: function (req, file, callback) {//파일 저장 폴더 지정
        callback(null, 'uploads')
    },
    filename: function (req, file, callback) {//저장 파일이름 지정

        //확장자를 별도롤 저장하여 처리하는 방법
        var extension = path.extname(file.originalname);//파일 확장자 추출
        var basename = path.basename(file.originalname, extension);//파일명만 추출
        callback(null, basename + req.user.username + extension);
            }
});

// multer 설정
var upload = multer({
    storage: storage,//파일 저장 장소 등
    limits: {//업로드 파일 수(10개), 파일 크기(1G) 제한 속성 설정
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
});

var router   = express.Router();

// New
router.get("/new", util.isLoggedin, function(req, res){
  var tutor = req.flash("tutor")[0] || {};
  var errors = req.flash("errors")[0] || {};
  var partTutor = [];
  var findTutor = [];

  if((req.user.position) == "튜터") {
      console.log("튜터 로그인");
	  
      Tutor.find()
          .exec(function(err, tutors){
              if(err) return res.json(err);
              
		      // 등록한 스터디 찾기
              for(let i=0; i<tutors.length; i++){
                      if(String(tutors[i].name) === String(req.user._id)){
                          findTutor.push(tutors[i]);
                      }
                  }
		  
              User.findOne({_id:req.user._id})
                  .exec(function(err, fUser){
                      if(err) return res.json(err);
                      res.render("tutors/carousel_mypage2", { tutor:tutor, tutors:findTutor, findUser:fUser, errors:errors });
                  });
          });
  }

    if((req.user.position) == "멘티") {
        console.log("멘티 로그인");
        Tutor.find()
            .exec(function(err, tutors){
                if(err) return res.json(err);

                // 참여한 튜터 조회
                for(let i=0; i<tutors.length; i++){
                    for(let j=0; j<tutors[i].participateUser.length; j++){
                        console.log('i, j 값: ' + i + ', ' + j);
                        console.log('신청유저 값: ' + req.user._id);
                        console.log('partiUser 값: ' + tutors[i].participateUser[j]);
                        if(String(tutors[i].participateUser[j]) === String(req.user.name)){
                            partTutor.push(tutors[i]);
                        }
                    }
                }

                User.findOne({_id:req.user._id})
                    .exec(function(err, fUser){
                        if(err) return res.json(err);
                        res.render("tutors/carousel_mypage1", { tutor:tutor, tutors:partTutor, findUser:fUser, errors:errors });
                    });
            });
    }
});

/* study create */
router.post("/create", util.isLoggedin, upload.array('file', 1), function(req, res){
    try {
        /* 업로드된 파일은 요청객체(req)의 files 객체(배열객체)에 저장됨,
           따라서 업로드한 파일의 정보를 확인할 때는 req.files 배열에 있는 원소들을 참조
        */
        var files = req.files;//업로드 된 파일 추출

        console.log(files);
        console.dir('#===== 업로드된 첫번째 파일 정보 =====#');

        if (files.length > 0) {
            console.dir(req.files[0]);
        } else {
            console.log('업로드 된 파일이 없습니다.');
        }

        console.dir('#=====#');

        // 현재의 파일 정보를 저장할 변수 선언
        var originalname = '', //클라이언트에서 보낼 때의 원본 파일이름
            filename = '',     //서버에 저장될 파일 이름
            mimetype = '',     //MIME Type
            size = 0;          //파일 크기

        // 배열에 들어 있는 파일을 확인
        if (Array.isArray(files)) {// 배열에 들어가 있는 경우(설정에서 1개의 파일도 배열에 넣게 했음)
            console.log("배열에 들어있는 파일 갯수 : %d", files.length);

            for (var index = 0; index < files.length; index++) {
                originalname = files[index].originalname;
                filename = files[index].filename;
                mimetype = files[index].mimetype;
                size = files[index].size;
            }

        } else {   // 배열에 들어가 있지 않은 경우 (현재 설정에서는 해당 없음)
            console.log("파일 갯수 : 1 ");

            originalname = files[index].originalname;
            filename = files[index].name;
            mimetype = files[index].mimetype;
            size = files[index].size;
        }

        console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', '
            + mimetype + ', ' + size);

        req.body.img = '../uploads/'+filename;

    } catch(err) {
        console.dir(err.stack);
    }
    req.body.name = req.user._id;
    Tutor.create(req.body, function(err, tutor){
        if(err){
            req.flash("tutor", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/signUp.html");
        }
        res.redirect("/tutors/new");
    });
});

// 자세히 보기
router.post("/:id", function (req, res) {
    var errors = req.flash("errors")[0] || {};
    console.log("post 실행" + req.params.id);

    Tutor.findOne({_id: req.params.id})
        .exec(function(err, tutors){
            if(err) return res.json(err);
            console.log("tutors값: " + tutors);

            User.findOne({_id: tutors.name})
                .exec(function(err, fUser){
                    if(err) return res.json(err);

                    console.log("findUser값: " + fUser);
                    res.render("tutors/TutorDetail", { tutors:tutors, findUser:fUser, errors:errors });
                });

        });
});

// 신청하기
router.post("/user/:id", function (req, res) {
    var userId = req.user.name;

    Tutor.findOneAndUpdate({_id: req.params.id}, {$push: { participateUser : userId}},{new:true}, function(err, user){
        console.log(req.params.id);
        if(err){
            req.flash("user", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/signUp.html");
        }
        console.log("추가 완료");
        res.redirect('/');
    });

});

// 프로필 수정 (이미지만 구현완료)
router.put("/crprofile", util.isLoggedin, upload.array('fileProfile', 1), function(req, res){
    var info = req.user.exampleFormControlTextarea1;
    var userImg;

    try {
        /* 업로드된 파일은 요청객체(req)의 files 객체(배열객체)에 저장됨,
           따라서 업로드한 파일의 정보를 확인할 때는 req.files 배열에 있는 원소들을 참조
        */
        var files = req.files;//업로드 된 파일 추출

        console.log(files);
        console.dir('#===== 업로드된 첫번째 파일 정보 =====#');


        if (files.length > 0) {
            console.dir(req.files[0]);
        } else {
            console.log('업로드 된 파일이 없습니다.');
        }

        console.dir('#=====#');

        // 현재의 파일 정보를 저장할 변수 선언
        var originalname = '', //클라이언트에서 보낼 때의 원본 파일이름
            filename = '',     //서버에 저장될 파일 이름
            mimetype = '',     //MIME Type
            size = 0;          //파일 크기

        // 배열에 들어 있는 파일을 확인
        if (Array.isArray(files)) {// 배열에 들어가 있는 경우(설정에서 1개의 파일도 배열에 넣게 했음)
            console.log("배열에 들어있는 파일 갯수 : %d", files.length);

            for (var index = 0; index < files.length; index++) {
                originalname = files[index].originalname;
                filename = files[index].filename;
                mimetype = files[index].mimetype;
                size = files[index].size;
            }

        } else {   // 배열에 들어가 있지 않은 경우 (현재 설정에서는 해당 없음)
            console.log("파일 갯수 : 1 ");

            originalname = files[index].originalname;
            filename = files[index].name;
            mimetype = files[index].mimetype;
            size = files[index].size;
        }

        console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', '
            + mimetype + ', ' + size);

        userImg = '../uploads/'+filename;

    } catch(err) {
        console.dir(err.stack);
    }

    User.update({_id:req.user._id},{$set: {selfInfo : info, img : userImg}}, {new:true}, function(err, user){
        console.log("업데이트 완료");
        if(err){
            req.flash("user", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/signUp.html");
        }
        res.redirect("/tutors/new");
    });
});

module.exports = router;