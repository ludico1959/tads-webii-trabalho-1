const { Router } = require('express');
const UserController = require("../controllers/user.controller");

const router = Router(); 

const userController = new UserController();

router.post("/create", (req, res) => userController.create(req, res));
router.get("/get/:id", (req, res) => userController.get(req, res));
router.get("", (req, res) => userController.list(req, res));
router.put("/put/:id", (req, res) => userController.update(req, res));
router.delete("/delete/:id", (req, res) => userController.delete(req, res));

router.get("/add", (req, res) => userController.renderAddPage(req, res));
router.get("/edit/:id", (req, res) => userController.renderEditPage(req, res));
router.get("/remove/:id", (req, res) => userController.renderRemovePage(req, res));

router.get("/export/csv", (req, res) => userController.exportCSV(req, res));

module.exports = router;
