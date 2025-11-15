import express from "express";
import { getPoemsByWriter, getWriterProfile } from "../controller/writerController.js";

const router = express.Router();

router.get("/:userId", getWriterProfile);
router.get("/writer/:id", getPoemsByWriter);



export default router;
