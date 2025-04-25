const express = require('express');
const router = express.Router();
const axios = require("axios")
const {autenticado} = require("../middlewares/authMiddleware.js")

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

    if (response.data.success) {
        req.session.userId = response.data.user.id
        req.session.firstName = response.data.user.firstName
        return res.json({ success: true })
    } else {
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
    const { firstName, lastName, email, password } = req.body

    const response = await axios.post("http://localhost:5000/user/addUser", {firstName, lastName, email, password})

    if (response.data.user) {
        req.session.userId = response.data.user.id
        req.session.firstName = response.data.user.firstName
        return res.json({ success: true })
    } else {
        return res.json({ success: false })
    }
})

// Workspace 
router.get('/workspaces/', autenticado, async (req, res) => {
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

router.get('/profile/', autenticado, async (req, res) => {
    const id = req.session.userId

    const response = await axios.get(`http://localhost:5000/user/getById/${id}`)
    
    res.render('profile', { title: 'Profile', firstName: req.session.firstName, userId: req.session.userId, user: response.data.user});
});

router.post('/profile', async (req, res) => {
    try {
        const id = req.session.userId;
        const { firstName, lastName, email } = req.body;
    
        // Chamada para sua API que faz a atualização no banco de dados
        const response = await axios.put(`http://localhost:5000/user/editUser/${id}`, {
            firstName,
            lastName,
            email
        });

        if (response.data.success) {
            // Atualiza os dados na sessão
            req.session.firstName = firstName;
            req.session.lastName = lastName;
            req.session.email = email;
            
            res.json({ success: true, message: 'Perfil atualizado com sucesso!' });
        } else {
            res.json({ success: false, message: response.data.message || 'Erro ao atualizar perfil' });
        }
    } catch (error) {
        console.error('Erro ao editar perfil:', error);
        res.json({ success: false, message: 'Erro interno ao atualizar perfil' });
    }
});

// Items 
router.get('/items/:id', autenticado, async (req, res) => {
    const {id} = req.params

    const responseItems = await axios.get(`http://localhost:5000/item/getByWorkspace/${id}`)
    const responseWorkspaceData = await axios.get(`http://localhost:5000/workspace/getById/${id}`)

    res.render('workspace-items', { title: 'Items', firstName: req.session.firstName, userId: req.session.userId, items: responseItems.data, workspace: responseWorkspaceData.data.workspace});
});

router.post("/items/", async (req, res) => {
    const { itemName, category, serialNumber, value, assignedTo, location, description, purchaseDate, workspaceId } = req.body;

    const response = await axios.post("http://localhost:5000/item/addItem", {itemName, category, serialNumber, value, assignedTo, location, description, purchaseDate, workspaceId})

    if (response.data.success) {
        return res.json({ success: true })
    } else {
        return res.json({ success: false })
    }
})

router.put("/item/:id", async (req, res) => {
    const { itemName, category, serialNumber, value, assignedTo, location, description, purchaseDate } = req.body;
    const {id} = req.params

    const response = await axios.put(`http://localhost:5000/item/editItem/${id}`, {itemName, category, serialNumber, value, assignedTo, location, description, purchaseDate })

    if (response.data.success) {
        return res.json({ success: true })
    } else {
        return res.json({ success: false })
    }
})

router.delete("/item/:id", async(req, res) => {
    const {id} = req.params

    const response = await axios.delete(`http://localhost:5000/item/deleteItem/${id}`)

    if (response.data.success) {
        return res.json({ success: true })
    } else {
        return res.json({ success: false })
    }
})

module.exports = router;
