var express = require('express');
var router = express.Router();
const usermodel = require('./users');
const Employee=require('./employee');

const passport = require('passport');

const LocalStrategy = require("passport-local").Strategy;

// Configure passport to use local strategy
passport.use(new LocalStrategy(usermodel.authenticate()));

// Middleware to check if user is logged in
function isloggedin(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// GET home page (registration/login page)
router.get('/', function(req, res, next) {
  const errorMessage = req.flash('error'); // Fetch the flash message
  console.log(errorMessage); // For debugging
  res.render('index'); // Pass the message to the view
});

// GET feeds page

router.get('/addnew',function(req, res, next) {
  
  
  
  // Log user object for debugging
  res.render("adduser");

});


 
router.post('/create', async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.session.passport || !req.session.passport.user) {
      return res.status(401).json({ message: 'User is not authenticated' });
    }

    console.log('Logged-in user:', req.session.passport.user);

    // Find the user based on the session username
    const user = await usermodel.findOne({ username: req.session.passport.user });

    // Check if the user was found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the employee record
    const employee = await Employee.create({
      employeename: req.body.employeename,
      salary: req.body.salary,
      phoneno: req.body.phoneno,
      branch: req.body.branch,
      user: user._id // Reference to the user
    });

    // Add the employee's ID to the user's employee list
    user.employeelst.push(employee._id);
    await user.save(); // Save the user document

    // Redirect to the profile page
    res.redirect('./profile');
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee', error: error.message || error });
  }
});
router.get('/profile',isloggedin, async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.session.passport || !req.session.passport.user) {
      return res.status(401).json({ message: 'User is not authenticated' });
    }

    // Find the user based on the session username
    const user = await usermodel.findOne({ username: req.session.passport.user }).populate('employeelst');

    // Check if the user was found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Render the profile page with the user's employees and username
    res.render('profile', { employees: user.employeelst, username: user.username });
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).json({ message: 'Error loading profile', error: error.message || error });
  }
});








 
 



// Route to display all employees
router.get('/', async (req, res) => {
  try {
      const employees = await Employee.find(); // Fetch all employees from the database
      res.render('manageEmployees', { employees }); // Render the manageEmployees.ejs page with the employees
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching employees');
  }
});

// GET profile page

// GET show posts page


// GET login page
router.get('/login', (req, res) => {
  const error = req.flash('error'); // Get error message
  console.log("Rendering login with error:", error);  // Debugging line
  res.render('index'); // Render the login page (using index.ejs)
});

// GET add new page

// POST register user
// POST register user
router.post('/register', function(req, res, next) {
  const { username, email, password } = req.body; // Capture the necessary input fields
  const userdata = new usermodel({ username, email }); // Only include username and email

  usermodel.register(userdata, password) // Use the captured password
    .then(function() {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/profile"); // Redirect to profile on success
      });
    })
    .catch(function(err) {
      console.error("Registration Error:", err);
      if (err.name === 'UserExistsError') {
        req.flash('error', 'Username already exists'); // Set the flash message for existing users
        return res.redirect('/'); // Redirect to home page
      }
      req.flash('error', 'Registration failed, please try again'); // Set a general error message
      res.redirect('/'); // Redirect to home page
    });
    console.log(usermodel);
});


// POST login user
router.post('/login', passport.authenticate('local', {
  successRedirect: "/profile",
  failureFlash: true,
  failureRedirect: "/login",
}), function(req, res) {
  // Optional: Additional logic can go here
});

// GET logout
router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
function isloggedin(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}



// Delete employee by ID
router.post('/delete/:id',isloggedin, async (req, res) => {
 
    const employeeId = req.params.id;
    console.log('Employee ID to delete:', employeeId);

    const employee = await Employee.findByIdAndDelete(employeeId);
    console.log('Deleted employee:', employee);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const user = await usermodel.findById(employee.user);
    console.log('User who owns employee:', user);

    if (user) {
      user.employeelst.pull(employeeId);
      await user.save();
    }

    res.redirect('/profile');
  
});
router.get('/edit/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.render('edit', { employee });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee', error });
  }
});


router.post('/edit/:id', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, {
      employeename: req.body.employeename,
      salary: req.body.salary,
      phoneno: req.body.phoneno,
      branch: req.body.branch
    }, { new: true });

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.redirect('/profile');
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error });
  }
});








// POST upload new post


// POST change profile image


module.exports = router;
