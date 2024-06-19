import express from "express";
import { findBestAnswer } from "../lib/utils.js";

const queryRouter = express.Router();

queryRouter.post("/query", async (req, res) => {
  const query = req.body.query;
  let ans;

  try {
    ans = await findBestAnswer(query);
    return res.status(200).json({
      success: true,
      ans
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing the query.'
    });
  }
});

export default queryRouter;