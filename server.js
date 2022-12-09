import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import getEndpoints from 'express-list-endpoints';
// import themeData from './data/themes.json'
// import decorationsData from './data/decorations.json'
// import drinksData from './data/drinks.json'
// import activitiesData from './data/activities.json'
// import foodData from './data/food.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/backend-test";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const crypto = require("crypto")

// ************ SCHEMAS & MODELS *************** //
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    minlength: 8,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  },
});

const ThemeSchema = new mongoose.Schema({
  name: String,
  image: String,
  type: Array
}); 

const DecorationSchema = new mongoose.Schema({
  name: String,
  image: String,
  type: Array,
  belongs_to_themes: Array
})

const FoodSchema = new mongoose.Schema({
  name: String,
  image: String,
  type: Array,
  belongs_to_themes: Array
})

const DrinkSchema = new mongoose.Schema({
  name: String,
  image: String,
  type: Array,
  belongs_to_themes: Array
})

const ActivitySchema = new mongoose.Schema({
  name: String,
  image: String,
  type: Array,
  belongs_to_themes: Array
})

const User = mongoose.model("User", UserSchema);
const Theme = mongoose.model("Theme", ThemeSchema);
const Decoration = mongoose.model("Decoration", DecorationSchema);
const Food = mongoose.model("Food", FoodSchema);
const Drink = mongoose.model("Drink", DrinkSchema);
const Activity = mongoose.model("Activity", ActivitySchema);


// ************ RESET DB *************** //
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
      const newFood = new Drink(singleFood);
      newFood.save()
    })
    activitiesData.forEach(singleActivity => {
      const newActivity = new Activity(singleActivity);
      newActivity.save()
    })

  }
  seedDataBase();
}

// ************ PORT *************** //
const port = process.env.PORT || 8080;
const app = express();

// ************ MIDDLEWARES *************** //
app.use(cors());
app.use(express.json());

// ************ USER AUTHENTICATION *************** //
const authenticateUser = async (req, res, next) => {
  const accessToken = req.header('Authorization');

  try {
    const user = await User.findOne({ accessToken });
    if (user) {
      next();  // when user is confirmed call the next function after authentication
    } else {
      res.status(401).json({ response: 'Please log in', success: false });
    }
  } catch (error) {
    res.status(500).json({ response: error, success: false });
  }
};

// ************ ENDPOINTS *************** //
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ 
      status_code: 503,
      error: "Server unavailable" })
  }
})

app.get('/', (req, res) => {
  res.send(getEndpoints(app));
});

// ************ SIGN IN/SIGN UP/UPDATE USER ENDPOINTS *************** //

app.post("/signUp", async (req, res) => {
  const { email, password } = req.body;
  try {
    const salt = bcrypt.genSaltSync();
    const userExists = await User.findOne({ email });

    if (password.length < 8) {
      res.status(400).json({
        response: "Password must be minimum 8 characters",
        success: false,
      });
    } else if (userExists) {
      res.status(400).json({
        response: "user already exists",
        success: false,
      });
    } else {
      const newUser = await new User({ email: email, password: bcrypt.hashSync(password, salt)}).save();
      res.status(201).json({
        response: {
          email: newUser.email,
          accessToken: newUser.accessToken,
          userId: newUser._id,
        },
        success: true,
      });
    }
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

app.post("/signIn", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email })
    if(user && bcrypt.compareSync(password, user.password)){
      res.status(201).json({
        success: true,
        response: {
          userId: user._id, 
          email: user.email,
          accessToken: user.accessToken}
        })
    } else {
      res.status(400).json({
        success: false,
        response: 'Credentials did not match'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error
    })
  }
})

app.delete("/:userId/admin/delete", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOneAndDelete({ userId })
    if(user) {
      res.status(200).json({
        success: true,
        response: 'account removed :('
      })
    } else {
      res.status(400).json({
        success: false,
        response: 'user not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error
    })
  }
})

app.patch("/:userId/admin/change", async (req, res) => {
  const { userId, password } = req.body 
  const salt = bcrypt.genSaltSync();
  try {
    const user = await User.findOne({ _id: userId })
    if (user) {
    const newPassword = bcrypt.hashSync(password, salt)
    const updateUser = await User.findByIdAndUpdate({ _id: userId}, { $set:{
      password: newPassword}
     })
    res.status(200).json({
        success: true,
        data: updateUser,
        response: 'password changed'
      })
    } else {
      res.status(400).json({
        success: false,
        response: 'user not found'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      response: error
    })
  }
})

// ************ CATEGORY ENDPOINTS *************** //
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

app.get("/themes/type/kids", async (req, res) => {
  try {
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

app.get("/themes/type/grownup", async (req, res) => {  
  try {
    const themeGrownup = await Theme.find({ grownup: true });

    if (themeKids) {
      res.status(200).json({
      success: true,
      theme: themeGrownup
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

// grownup = true 
/* app.get("/drinks/grownup", async ( req, res) => {
  try {
    const drinksGrownup = await Drink.find({ grownup: true });

    if(drinksGrownup){
      res.status(200).json({
        response: drinksGrownup,
        success: true
      })
    } 
  } catch (error) {
    res.status(400).json({
      response: "Can't find any drinks for adults right now",
      success: false
    })
  }
})
 */

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

app.get("activities", async ( req, res) => {

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


// ************ PROJECT ENDPOINTS *************** //

// ************ PROJECTBOARD ENDPOINTS *************** //

// ************ START SERVER *************** //
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
