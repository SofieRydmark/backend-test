import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import themeData from './data/themes.json'
import decorationsData from './data/decorations.json'
import drinksData from './data/drinks.json'
import activitiesData from './data/activites.json'
import foodData from './data/food.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/backend-test";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start

const Theme = mongoose.model("Theme", {
  name: String,
  image: String,
  kids: Boolean,
  grownup: Boolean,
  type: Array,
  
}); 

const Decoration = mongoose.model("Decoration", {
  name: String,
  image: String,
  kids: Boolean,
  grownup: Boolean,
  type: Array,
  belongs_to_themes: Array
})

const Food = mongoose.model("Food", {
  name: String,
  image: String,
  kids: Boolean,
  grownup: Boolean,
  type: Array,
  belongs_to_themes: Array
})

const Drink = mongoose.model("Drink", {
  name: String,
  image: String,
  kids: Boolean,
  grownup: Boolean,
  type: Array,
  belongs_to_themes: Array
})

const Activity = mongoose.model("Activity", {
  name: String,
  image: String,
  kids: Boolean,
  grownup: Boolean,
  type: Array, 
  belongs_to_themes: Array
})

if(process.env.RESET_DB) {
  const seedDataBase = async () => {
    await Theme.deleteMany(); 
    await Decoration.deleteMany(); 
    await Drink.deleteMany();
    await Activity.deleteMany();
    await Food.deleteMany();

    themeData.forEach(singleTheme => {
      const newTheme = new Theme(singleTheme);
      newTheme.save();
    })
    decorationsData.forEach(singleDecor => {
      const newDecoration = new Decoration(singleDecor);
      newDecoration.save();
    })
    drinksData.forEach(singleDrink => {
      const newDrink = new Drink(singleDrink);
      newDrink.save()
    })
    foodData.forEach(singleFood => {
      const newFood = new Food(singleFood);
      newFood.save()
    })
    activitiesData.forEach(singleActivity => {
      const newActivity = new Activity(singleActivity);
      newActivity.save()
    }) 
    // await Decoration.deleteMany(); 
    // await Food.deleteMany(); 

    /* await new Theme({ name: "halloween", image: "http://wwww.hello.com", kids: true, grownup: true }).save();
    await new Decoration({ name: "balloons", image: "http://wwww.hello.com", kids: true, grownup: true, belongs_to_themes: "all" }).save();
    await new Food({ name: "cupcakes", image: "http://wwww.hello.com", kids: true, grownup: true, belongs_to_themes: "all" }).save(); */

  }
  seedDataBase();
}

const port = process.env.PORT || 8090;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// If connection to server is down, show below and don't move to routes
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ 
      status_code: 503,
      error: "Server unavailable" })
  }
})

app.get("/", (req, res) => {
  res.send({
    Welcome: "Our test data for final project.",
    Routes: [
      {
        "/themes": "Show all themes.",
        "/themes/:id": "Show single theme by id",
        "/themes/type/:type": "Type = grownup or kids, to see specific themes to different types",
        "/food": "Show all foods.",
        "/food/type/:type": "Type = grownup or kids, to see specific food options to different types",
        "/decorations": "Show all decorations.",
        "/decorations/type/:type": "Type = grownup or kids, to see specific decorations options to different types",
        "/drinks": "Show all drinks options", 
        "/drinks/type/:type": "Type = grownup or kids, to see specific drinks options to different types",
        "/activities": " Show all activities options",
        "/activities/type/:type": "Type = grownup or kids, to see activity options to different types",
      },
    ]});
});

// Start defining your routes here

/* --------- THEMES GET  ----------- */
/* app.get("/themes",authenticateUser) */
app.get("/themes", async (req,res) => {
  try {
    const themesCollection = await Theme.find()
    res.status(200).json({
      response: themesCollection,
      success: true
    })
  } catch (error) {
    res.status(400).json({
      response: "Can't find any themes options right now",
      success: false
    })
  }
})
/* app.get("/themes/:id",authenticateUser) */
 app.get("/themes/:id", async (req, res) => {
  try {
    const themeId = await Theme.findById(req.params.id);

    if (themeId) {
      res.status(200).json({
      success: true,
      theme: themeId
    })
    } else {
      res.status(404).json({
        success: false,
        status_code: 404,
        error: `Id not found, try another`
    })
    }
  } catch (err) {
    res.status(400).json({ 
      success: false,
      status_code: 400,
      error: "Invalid id" 
    })
  }

})
/* app.get("/themes/type/:type",authenticateUser) */
app.get("/themes/type/:type", async (req, res) => {
  
  try{
  const typeOf = await Theme.find({type : req.params.type})
   if (!typeOf) {
    res.status(400).json({
      response: "not found",
      success: false, 
    })
  } else {
    res.status(200).json({
      response: typeOf,
      success: true  
    })
  } 
} catch (error) {
  res.status(400).json({
    response: "Can't find any activities options for your type right now",
    success: false
  })
}
})

/* --------- DECORATIONS GET ----------- */
/* app.get("/decorations",authenticateUser) */
app.get("/decorations", async (req, res) => {
  try {
    const decorationsCollection = await Decoration.find()
    res.status(200).json({
      response: decorationsCollection,
      success: true
    })
  } catch (error) {
    res.status(400).json({
      response: "Can't find any decorations options right now",
      success: false
    })
  }
})

/* app.get("/decorations/type/:type",authenticateUser) */
app.get("/decorations/type/:type", async (req, res) => {
  
  try{
  const typeOf = await Decoration.find({type : req.params.type})
   if (!typeOf) {
    res.status(400).json({
      response: "not found",
      success: false, 
    })
  } else {
    res.status(200).json({
      response: typeOf,
      success: true  
    })
  } 
} catch (error) {
  res.status(400).json({
    response: "Can't find any decorations options for your type right now",
    success: false
  })
}
})
/* --------- DRINKS GET  ----------- */
/* app.get("/drinks",authenticateUser) */
app.get("/drinks", async ( req, res) => {

  try {
    const drinks = await Drink.find()
    res.status(200).json({
      response: drinks,
      success: true
    })
  } catch (error) {
    res.status(400).json({
      response: "Can't find any drinks option right now",
      success: false
    })
  }
})

/* app.get("/drinks/type/:type",authenticateUser) */
app.get("/drinks/type/:type", async (req, res) => {
  
  try{
  const typeOf = await Drink.find({type : req.params.type})
   if (!typeOf) {
    res.status(400).json({
      response: "not found",
      success: false, 
    })
  } else {
    res.status(200).json({
      response: typeOf,
      success: true  
    })
  } 
} catch (error) {
  res.status(400).json({
    response: "Can't find any drinks options for your type right now",
    success: false
  })
}
})


/* --------- FOOD GET  ----------- */
/* app.get("/food",authenticateUser) */
app.get("/food", async ( req, res) => {

  try {
    const foodCollection = await Food.find()
    res.status(200).json({
      response: foodCollection,
      success: true
    })
  } catch (error) {
    res.status(400).json({
      response: "Can't find any food options right now",
      success: false
    })
  }
})

/* app.get("/food/type/:type",authenticateUser) */
app.get("/food/type/:type", async (req, res) => {
  
  try{
  const typeOf = await Food.find({type : req.params.type})
   if (!typeOf) {
    res.status(400).json({
      response: "not found",
      success: false, 
    })
  } else {
    res.status(200).json({
      response: typeOf,
      success: true  
    })
  } 
} catch (error) {
  res.status(400).json({
    response: "Can't find any food options for your type right now",
    success: false
  })
}
})
/* --------- ACTIVITIES GET  ----------- */
/* app.get("/activities",authenticateUser) */
app.get("/activities", async ( req, res) => {

  try {
    const activitiesCollection = await Activity.find()
    res.status(200).json({
      response: activitiesCollection,
      success: true
    })
  } catch (error) {
    res.status(400).json({
      response: "Can't find any activities options right now",
      success: false
    })
  }
})

/* app.get("/activities/type/:type",authenticateUser) */
app.get("/activities/type/:type", async (req, res) => {
  
  try{
  const typeOf = await Activity.find({type : req.params.type})
   if (!typeOf) {
    res.status(400).json({
      response: "not found",
      success: false, 
    })
  } else {
    res.status(200).json({
      response: typeOf,
      success: true  
    })
  } 
} catch (error) {
  res.status(400).json({
    response: "Can't find any Activity options for your type right now",
    success: false
  })
}
})



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
