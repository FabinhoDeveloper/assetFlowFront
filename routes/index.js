const express = require('express');
const router = express.Router();
const axios = require("axios")

router.get('/', (req, res) => {
    res.render('home', { title: 'Página Inicial'});
});

// Login
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login'});
});

router.post("/login", async (req, res) => {
    const {email, password} = req.body

    const response = await axios.post("http://localhost:5000/user/auth", { email, password })

    try {
        if (response.data.user) {
            req.session.userId = response.data.user.id
            req.session.firstName = response.data.user.firstName
            return res.json({ success: true })
        }
    } catch (error) {
        return res.json({ success: false })
    }
    
    
})

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao encerrar a sessão:", err);
            return res.status(500).send("Erro ao fazer logout");
        }
        res.clearCookie("connect.sid"); // opcional, remove o cookie de sessão
        res.redirect("/") // ou envie um status 200 se for API
    });
});


// User register
router.get('/register', (req, res) => {
    res.render('register', { title: 'Registro'});
});

router.post("/register", async (req, res) => {
    const { firstName, lastName, company, email, password } = req.body

    const response = await axios.post("http://localhost:5000/user/addUser", {firstName, lastName, company, email, password})

    if (response.data.user) {
        req.session.userId = response.data.user.id
        req.session.firstName = response.data.user.firstName
        return res.json({ success: true })
    } else {
        return res.json({ success: false })
    }
})

// Workspace 
router.get('/workspaces/', async (req, res) => {
    const userId = req.session.userId

    const response = await axios.get(`http://localhost:5000/workspace/getByUser/${userId}`)

    res.render('workspaces', { title: 'Workspaces', firstName: req.session.firstName, userId: req.session.userId, workspaces: response.data});
});

router.post("/workspaces", async (req, res) => {
    const {workspaceName, description, color} = req.body
    const {userId} = req.session

    const response = await axios.post("http://localhost:5000/workspace/add", {workspaceName, description, color, userId})

    if (response.data.newWorkspace) {
        return res.json({ success: true })
    } else {
        return res.json({ success: false })
    }
})

router.delete("/workspace/:id", async (req, res) => {
    const {id} = req.params
    
    const response = await axios.delete(`http://localhost:5000/workspace/delete/${id}`)

    console.log(response.data)

    if (response.data.success) {
        return res.json({ success: true })
    } else {
        return res.json({ success: false })
    }
})

router.put("/workspace/:id", async (req, res) => {
    const { id } = req.params;
    const { workspaceName, description, color } = req.body;
  
    try {
      const response = await axios.put(`http://localhost:5000/workspace/edit/${id}`, {
        workspaceName,
        description,
        color
      });
  
      if (!response.data.error) {
        return res.json({ success: true });
      } else {
        return res.json({ success: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erro ao atualizar workspace." });
    }
  });
  

// Profile

router.get('/profile/', async (req, res) => {
    const id = req.session.userId
    console.log(id)

    const response = await axios.get(`http://localhost:5000/user/getById/${id}`)
    
    res.render('profile', { title: 'Profile', firstName: req.session.firstName, userId: req.session.userId, user: response.data.user});
});

router.post('/profile/', async (req, res) => {
    const id = req.session.userId

    const response = await axios.get(`http://localhost:5000/user/editUser/${id}`, {})
    
    console.log(response.data.user)

    res.render('profile', { title: 'Profile', firstName: req.session.firstName, userId: req.session.userId, user: response.data.user});
});

// Items 
router.get('/items/:id', async (req, res) => {
    const {id} = req.params

    const response = await axios.get(`http://localhost:5000/item/getByWorkspace/${id}`)

    res.render('workspace-items', { title: 'Items', firstName: req.session.firstName, userId: req.session.userId, items: response.data.items});
});

router.post("/items/", async (req, res) => {
    const { itemName, category, serialNumber, value, assignedTo, location, description, purchaseDate } = req.body;
    const {workspaceId} = req.session

    const response = await axios.post("http://localhost:5000/item/addItem", {itemName, category, serialNumber, value, assignedTo, location, description, purchaseDate, workspaceId})

    if (response.data.newItem) {
        return res.json({ success: true })
    } else {
        return res.json({ success: false })
    }
})

module.exports = router;
