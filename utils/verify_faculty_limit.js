require('dotenv').config();
const mongoose = require('mongoose');
const { Survey } = require('../model/survey');
const User = require('../model/user');
// Mocking the controller logic partially by invoking it or simulating it?
// Checking paths. We are in utils/, so ../model is correct. ../controllers is correct.

const { submitAnswers, createSurvey, checkSurveyMaxParticipants, updateAnswer } = require('../controllers/main');

const mockRes = () => {
    const res = {};
    res.statusCode = 0;
    res.data = null;
    res.ended = false; // track if end() or similar called

    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        res.ended = true;
        return res;
    };
    res.send = (data) => {
        res.data = data;
        res.ended = true;
        return res;
    };
    return res;
};

const runVerification = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn("MONGODB_URI not found in env, trying local default");
            process.env.MONGODB_URI = "mongodb://localhost:27017/surveypro";
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to DB');
        }

        // cleanup
        const testTitle = "TEST_FACULTY_LIMIT_SURVEY_" + Date.now();

        // Create Users
        const user1 = await User.create({
            fullname: "Test User 1",
            email: `test1_${Date.now()}@example.com`,
            gender: "Male",
            faculty: "Engineering",
            department: "Civil",
            instituition: "Test Uni",
            password: "password",
            verified: true
        });

        const user2 = await User.create({
            fullname: "Test User 2",
            email: `test2_${Date.now()}@example.com`,
            gender: "Male",
            faculty: "Engineering",
            department: "Civil",
            instituition: "Test Uni",
            password: "password",
            verified: true
        });

        const creator = await User.create({
            fullname: "Creator User",
            email: `creator_${Date.now()}@example.com`,
            gender: "Female",
            faculty: "Science",
            department: "Physics",
            instituition: "Test Uni",
            password: "password",
            verified: true
        });

        console.log(`Created users: ${user1._id}, ${user2._id}`);

        user1.id = "user1_" + Date.now();
        await user1.save();
        user2.id = "user2_" + Date.now();
        await user2.save();
        creator.id = "creator_" + Date.now();
        await creator.save();

        // Create Survey via Controller
        const reqCreate = {
            body: {
                title: testTitle,
                description: "Test Description",
                no_of_participants: 10,
                gender: "all_genders",
                preferred_participants: [],
                max_faculty_participants: 1 // LIMIT IS 1
            },
            userId: creator.id
        };

        const resCreate = mockRes();
        const next = (err) => { console.error("Create Survey Error", err); };

        await createSurvey(reqCreate, resCreate, next);

        const surveyData = resCreate.data.survey;
        const surveyId = surveyData._id;
        console.log(`Created survey: ${surveyId} with limit: ${surveyData.max_faculty_participants}`);

        // Publish and Add Question
        const savedSurvey = await Survey.findById(surveyId);
        savedSurvey.published = true;
        savedSurvey.questions.push({
            questionText: "Test Q",
            questionType: "five_point",
            _id: new mongoose.Types.ObjectId()
        });
        savedSurvey.faculty_participants = {};
        await savedSurvey.save();

        // TEST checkSurveyMaxParticipants
        console.log("\nTesting checkSurveyMaxParticipants...");
        const reqCheck1 = {
            params: { surveyId: surveyId },
            userId: user1.id
        };
        const resCheck1 = mockRes();
        await checkSurveyMaxParticipants(reqCheck1, resCheck1, next);
        console.log("User 1 Check Result:", resCheck1.data);
        if (resCheck1.data.maxReached === true) {
            throw new Error("User 1 Check: Should NOT be maxReached yet.");
        }

        // User 1 Submit
        console.log("\nSubmitting for User 1...");
        const reqSubmit1 = {
            params: { surveyId: surveyId },
            body: {
                answers: [{ questionId: savedSurvey.questions[0]._id.toString(), response: "5" }]
            },
            userId: user1.id
        };
        const resSubmit1 = mockRes();
        await submitAnswers(reqSubmit1, resSubmit1, next);
        console.log("User 1 Submit Result:", resSubmit1.statusCode);

        if (resSubmit1.statusCode !== 200) {
            throw new Error("User 1 submission failed");
        }

        // TEST checkSurveyMaxParticipants again for User 2
        console.log("\nTesting checkSurveyMaxParticipants for User 2 (Should be max reached)...");
        const reqCheck2 = {
            params: { surveyId: surveyId },
            userId: user2.id
        };
        const resCheck2 = mockRes();
        await checkSurveyMaxParticipants(reqCheck2, resCheck2, next);
        console.log("User 2 Check Result:", resCheck2.data);

        if (resCheck2.data.maxReached !== true) {
            throw new Error("User 2 Check: Should be maxReached due to faculty limit.");
        }
        if (resCheck2.data.reason !== 'faculty_limit') {
            throw new Error("User 2 Check: Reason should be 'faculty_limit'.");
        }

        // Test updateAnswer for User 2 (Should Fail)
        // Need to mock updateAnswer call? 
        // Wait, updateAnswer updates an existing answer OR adds a new one?
        // "answer successfully updated by..." or "question.answers.push"
        // Does it increment participant count?
        // Looking at updateAnswer code:
        // It pushes to question.answers.
        // It DOES NOT increment survey.participants.
        // However, logic says: if (survey.submittedUsers.includes(user._id)) -> error
        // And: if (survey.participants >= survey.no_of_participants) -> error
        // And NOW: if (currentFacultyCount >= survey.max_faculty_participants) -> error

        // Since User 2 hasn't submitted yet (submitAnswers call hasn't happened yet for User 2),
        // UpdateAnswer is often used for saving progress before final submission, or submitting individual answers.
        // In this app, it seems `submitAnswers` is final submission, `updateAnswer` is individual question answer save.
        // But `updateAnswer` adds to `question.answers`. 
        // Does `updateAnswer` check logic? Yes we added it.

        console.log("\nTesting updateAnswer for User 2 (Should Fail)...");
        const reqUpdate2 = {
            params: { surveyId: surveyId, questionId: savedSurvey.questions[0]._id.toString() }, // updateAnswer usually takes questionId in params
            body: {
                response: "4"
            },
            userId: user2.id
        };
        const resUpdate2 = mockRes();
        await updateAnswer(reqUpdate2, resUpdate2, next);
        console.log("User 2 UpdateAnswer Result Status:", resUpdate2.statusCode);
        console.log("User 2 UpdateAnswer Result Data:", resUpdate2.data);

        if (resUpdate2.statusCode !== 400 || !resUpdate2.data.msg.includes("Maximum number of participants for faculty")) {
            throw new Error("User 2 updateAnswer should have failed with faculty limit error.");
        }
        console.log("User 2 updateAnswer failed as expected.");

        console.log("VERIFICATION SUCCESSFUL");

        // cleanup
        await User.deleteOne({ _id: user1._id });
        await User.deleteOne({ _id: user2._id });
        await User.deleteOne({ _id: creator._id });
        await Survey.deleteOne({ _id: surveyId });

    } catch (err) {
        console.error("Verification Failed:", err);
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
};

runVerification();
