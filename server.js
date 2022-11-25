import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import themeData from './data/themes.json'

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
  grownup: Boolean
}); 

const Decoration = mongoose.model("Decoration", {
  name: String,
  image: String,
  kids: Boolean,
  grownup: Boolean,
  belongs_to_themes: String
})

const Food = mongoose.model("Food", {
  name: String,
  image: String,
  kids: Boolean,
  grownup: Boolean,
  belongs_to_themes: String
})

const Drink = mongoose.model("Drink", {
  name: String,
  image: String,
  kids: Boolean,
  grownup: Boolean,
  belongs_to_themes: String
})

const Activity = mongoose.model("Activity", {
  name: String,
  image: String,
  kids: Boolean,
  grownup: Boolean,
  belongs_to_themes: String
})

if(process.env.RESET_DB) {
  const seedDataBase = async () => {
    await Theme.deleteMany(); 
    themeData.forEach(singleTheme => {
      const newTheme = new Theme(singleTheme);
      newTheme.save();
    })
    // await Decoration.deleteMany(); 
    // await Food.deleteMany(); 

    /* await new Theme({ name: "halloween", image: "http://wwww.hello.com", kids: true, grownup: true }).save();
    await new Decoration({ name: "balloons", image: "http://wwww.hello.com", kids: true, grownup: true, belongs_to_themes: "all" }).save();
    await new Food({ name: "cupcakes", image: "http://wwww.hello.com", kids: true, grownup: true, belongs_to_themes: "all" }).save(); */

  }
  seedDataBase();
}

const port = process.env.PORT || 8080;
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
        "/themes/:id": "Show single theme etc..",
        "/themes/kids": "Show all themes where kids = true",
        "/foods": "Show all foods.",
        "/decorations": "Show all decorations."
      },
    ]});
});

// Start defining your routes here
app.get("/themes", async (req,res) => {
  await Theme.find().then(themes => {
     res.status(200).json({
      success: true,
      theme: themes
     })
   })
 })

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

app.get("/themes/kids", async (req, res) => {
  try {e
    const themeKids = await Theme.find({ kids: true });

    if (themeKids) {
      res.status(200).json({
      success: true,
      theme: themeKids
    })
    } else {
      res.status(404).json({
        success: false,
        status_code: 404,
        error: `not found`
    })
    }
  } catch (err) {
    res.status(400).json({ 
      success: false,
      status_code: 400,
      error: "Invalid route" 
    })
  }

})

app.get("/food", async (req, res) => {
  await Food.find().then(foods => {
    res.status(200).json({
     success: true,
     food: foods
    })
  })
})

app.get("/decorations", async (req, res) => {
  await Decoration.find().then(decorations => {
    res.status(200).json({
     success: true,
     decorations: decorations
    })
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
