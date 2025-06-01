import { Router } from "express";
import r from "../stream.js"
import UserControllers from "../app/controllers/userControllers.js";

const router = Router();

router.use(r);
router.get('/user', UserControllers.get);

export default router