// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname+"/date.js");
const _ =require("lodash");

const app = express();

const day = date.getDate();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://sakka:test123@cluster0.td8gy.mongodb.net/todolistDB");

const taskSchema = {
  name:String
};

const Task = mongoose.model("task",taskSchema);

const task1 =new Task({
  name:"Welcome"
});

const task2 =new Task({
  name:"Press + to add task"
});

const task3 =new Task({
  name:"Press on check-box to delete"
});

const welcomeTasks =[task1,task2,task3];

const listSchema = {
  name:String,
  items:[taskSchema]
};

const List = mongoose.model("list",listSchema);



app.get("/", function(req, res) {

 const day = date.getDate();
  Task.find({},function(err,foundTasks){
    if(foundTasks.length===0){
      Task.insertMany(welcomeTasks,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successful add to db");
        }
      });
      res.render("list",{listTitle: day, newItems:foundTasks});
    }else{
      res.render('list', {listTitle: day, newItems:foundTasks});
    }
  });


});

app.get("/:cat",function(req,res){

  const newRoute=_.capitalize(req.params.cat);

  List.findOne({name:newRoute},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:newRoute,
          items:welcomeTasks
        });
        list.save();
        res.redirect("/"+newRoute);
      }else{
        res.render("list",{listTitle: foundList.name , newItems:foundList.items});
      }
    }
    });


});

app.get("/about",function(req,res){
  res.render("about");
});

app.post("/",function(req,res){

const itemName =req.body.newItem;
const listName = req.body.list;

const item= new Task({
  name: itemName
});
if(listName===day){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);

  });
}



});

app.post("/delete",function(req,res){
  const checkhedItemId =req.body.itemcheck;
  const listName = req.body.listName;


if(listName===day){

  Task.findByIdAndRemove(checkhedItemId,function(err){
    if(err){
      console.log(err);
    }else{

    res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkhedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }else{
      console.log(err);
    }
  });
}
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("your sever is runinng");
});
