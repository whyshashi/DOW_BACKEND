const UserTrainingProgress=require('../models/user.training.progress.model');
const {resultValidation}=require('../utils/validations/joi.validation');
const questionDb=require('../models/questionaire.model');

const getTrainingResults=async (req,res)=>{
    try {
        const { trainingId } = req.params;

        const results = await UserTrainingProgress.find({ trainingId })
            .populate("userId", "firstName lastName email createdAt") 
            .lean(); 
            if (!results.length) {
                return res.status(404).json({ message: "No training results found" });
            }
        const formattedResults = results.map(user => ({
            firstName: user.userId.firstName,
            lastName: user.userId.lastName,
            email: user.userId.email,
            registeredOn: user.userId.createdAt.toISOString().split("T")[0], 
            score: user.status === "Viewed" ? "NA" : user.score.toFixed(1), 
            completedOn: user.completedAt ? user.completedAt.toISOString().split("T")[0] : "NA" 
        }));
        const completedCount = results.filter(user => user.status === "Attempted").length;
        res.status(200).json({ trainingId, results: formattedResults, completedCount });
    } catch (error) {
        res.status(500).json(error);
    }
};
const submitTrainingAnswers = async (req, res) => {
    try {
        const { error, value } = resultValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        let { userId, trainingId, responses } = value;
        const questionIds = responses.map((response) => response.questionId);
        const questions = await questionDb.find({ _id: { $in: questionIds } });

        if (questions.length !== responses.length) {
            return res.status(400).json({ error: "One or more question IDs are invalid." });
        }

        let correctAnswers = 0;
        for (const response of responses) {
            let correctMcqs = 0;
            const questionId = response.questionId;
            const question = await questionDb.findById(questionId);

            if (!question) {
                console.error(`Question with ID ${questionId} not found.`);
                continue; 
            }

            const ans = question.answer;
            const checkAns = response.userAnswer;

            if (ans && checkAns) {
                ans.sort();
                checkAns.sort();

                if (ans.length !== checkAns.length) {
                        correctMcqs=0;
                } else {
                    for (let i = 0; i < ans.length; i++) {
                        if (ans[i] === checkAns[i]) correctMcqs++;
                    }
                }

                if (correctMcqs === ans.length) {
                    correctAnswers++;
                }
            } else {
                console.error("ans or checkAns is null or undefined");
            }

        }

        const score = (correctAnswers / responses.length) * 10;

        await UserTrainingProgress.findOneAndUpdate(
            { userId, trainingId },
            { responses, score, status: "Attempted", completedAt: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Training submitted successfully!", score });
    } catch (err) {
        console.error("Error submitting training:", err);
        res.status(500).json({ error: "Submission failed!" });
    }
};

module.exports={getTrainingResults,submitTrainingAnswers};