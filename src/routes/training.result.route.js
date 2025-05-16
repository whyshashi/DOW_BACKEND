const express = require("express");
const { getTrainingResults, submitTrainingAnswers } = require("../controllers/training.result.controller");
const jwtAuth = require('../middlewares/user.auth.jwt');

const resultRoute = express.Router();

resultRoute.get("/training-results/:trainingId",jwtAuth, getTrainingResults);
resultRoute.post("/submit-training",jwtAuth, submitTrainingAnswers);

module.exports = resultRoute;