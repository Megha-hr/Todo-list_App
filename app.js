//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
const _= require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const user=process.env.USER_NAME;
const password =process.env.USER_PASSWORD
mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser:true,useUnifiedTopology: true,useFindAndModify: false });
const itemSchema = {
  name:String
};

const Item =mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"welcome to your todolist"
});


const item2 = new Item({
  name:"Hit the + button to add a new item"
});

const item3 = new Item({
  name:"<--Hit this to delete an item"
});

const defaultItems =[item1,item2,item3];

const listSchema= {
  name:String,
  item:[itemSchema]
}

const List= mongoose.model("List",listSchema);

app.get("/", function(req, res) {


  Item.find({},function(err,founditems)
  {
    if(founditems.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("succesfully added new defaultItems");
        }
        });
        res.redirect("/");
    }
    else{

      res.render("list", {listTitle:"Today", newListItems: founditems});

    }
    
  });

 
});

app.get("/:customList", function(req,res){
  const customListname=_.capitalize(req.params.customList);
  List.findOne({name:customListname},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new List
        const list=new List({
          name:customListname,
          item:defaultItems
        });
        list.save();
        res.redirect("/"+customListname);
      }else{
        //show an existing List
       res.render("list",{listTitle:foundList.name, newListItems: foundList.item})
      }
    }
    
  })

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
const items=new Item({
  name:itemName
})
if(listName==="today"){
  items.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundlist){
   foundlist.item.push(items);
   foundlist.save();
      res.redirect("/"+listName);
    }
  )}


});

app.post("/delete",function(req,res){
  const checkItemId =req.body.checkbox;
  const listName=req.body.listname;
  if(listName==="today"){
    Item.findByIdAndRemove(checkItemId,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("item succesfully deleted ");
        res.redirect("/");
      }
    });
  }else{
   List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkItemId}}},function(err,foundlist){
     if(!err){
      res.redirect("/"+listName);
     }
   })
  }
 
})


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});
