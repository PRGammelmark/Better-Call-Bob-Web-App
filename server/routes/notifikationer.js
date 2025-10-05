import express from "express";
import { hentNotifikationer, opretNotifikation, sseNotifikationer, set, setFlere, laest, ulaest, sletNotifikation, hentFlereNotifikationer } from "../controllers/notifikationController.js";

const router = express.Router();

// Markér flere som set
router.patch("/set", setFlere);

// Markér som set
router.patch("/set/:id", set);

// Markér som læst
router.patch("/laest/:id", laest);

// Markér som ulæst
router.patch("/ulaest/:id", ulaest);

// Opret en ny notifikation
router.post("/", opretNotifikation);

// SSE endpoint
router.get("/stream/:userID", sseNotifikationer);

// Hent første 10 notifikationer for en bruger (seneste først)
router.get("/bruger/:userID", hentNotifikationer);

// Hent flere notifikationer for en bruger (seneste først)
router.get("/flere/:userID", hentFlereNotifikationer);


// Slet en notifikation
router.delete("/:id", sletNotifikation);

export default router;
