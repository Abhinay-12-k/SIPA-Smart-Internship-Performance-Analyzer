const OpenAI = require('openai');
const asyncHandler = require('express-async-handler');
const ActivityLog = require('../activity/activityLog.model');
const Task = require('../tasks/task.model');

// Configuration for Groq (OpenAI-compatible)
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

// @desc    Generate AI Feedback for an intern
// @route   POST /api/ai-feedback/:internId
// @access  Private (Admin/Mentor)
const generateFeedback = asyncHandler(async (req, res) => {
    const internId = req.params.internId;

    if (!internId) {
        res.status(400);
        throw new Error('Intern ID is required');
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
        console.error("GROQ_API_KEY is missing in .env");
        res.status(500);
        throw new Error('Groq API Key is not configured. AI Feedback is unavailable.');
    }

    try {
        // Fetch Performance Data for the intern
        const allTasks = await Task.find({ assignedTo: internId });
        const completedTasks = allTasks.filter(task => task.status === 'completed');

        const totalTasksCount = allTasks.length;
        const completedTasksCount = completedTasks.length;

        // Completion Rate
        const completionRate = totalTasksCount === 0 ? 0 : (completedTasksCount / totalTasksCount) * 100;

        // Average Feedback Score
        let totalScore = 0;
        let scoredTasksCount = 0;
        completedTasks.forEach(task => {
            if (task.feedbackScore !== undefined && task.feedbackScore !== null) {
                totalScore += task.feedbackScore;
                scoredTasksCount++;
            }
        });
        const averageFeedbackScore = scoredTasksCount === 0 ? 0 : (totalScore / scoredTasksCount);

        // Deadline Discipline
        let onTimeTasksCount = 0;
        completedTasks.forEach(task => {
            if (task.submittedAt && task.deadline && new Date(task.submittedAt) <= new Date(task.deadline)) {
                onTimeTasksCount++;
            }
        });
        const deadlineDiscipline = completedTasksCount === 0 ? 0 : (onTimeTasksCount / completedTasksCount) * 100;

        const performanceMetrics = {
            totalTasks: totalTasksCount,
            completedTasks: completedTasksCount,
            completionRate: Math.round(completionRate * 10) / 10,
            averageFeedbackScore: Math.round(averageFeedbackScore * 10) / 10,
            deadlineDiscipline: Math.round(deadlineDiscipline * 10) / 10
        };

        const taskHistory = allTasks.map(t => ({
            title: t.title,
            status: t.status,
            score: t.feedbackScore,
            comment: t.feedbackComment
        }));

        const prompt = `
        You are an expert internship mentor. Analyze the following intern performance data and provide a constructive feedback report in JSON format.

        Performance Metrics:
        ${JSON.stringify(performanceMetrics, null, 2)}

        Task History (last few tasks):
        ${JSON.stringify(taskHistory.slice(-5), null, 2)}

        Requirement:
        Provide a JSON response with these exact fields:
        - summary: A professional 3-sentence summary (string)
        - strengths: An array of 3 strengths (array of strings)
        - weaknesses: An array of 3 weaknesses (array of strings)
        - roadmap: An array of 3 learning goals (array of strings)

        CRITICAL SCHEMA RULES:
        1. NO NESTED OBJECTS. Every value must be a plain STRING.
        2. DO NOT use keys like "overall_impact", "progress_status", "next_steps", "text", or "rating".
        3. Use ONLY the 4 keys listed above.
        4. If you return an object inside an array, the system will crash. Return ONLY strings.

        Return only the JSON object. No other text.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a professional mentor providing data-driven internship performance analysis in strict JSON format." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });

        const aiResponse = completion.choices[0].message.content;
        let parsedResponse = JSON.parse(aiResponse);

        // --- ULTIMATE BACKEND SANITIZATION ---
        // Recursively flattens any object into a string to prevent React rendering errors
        const flattenToString = (val) => {
            if (val === null || val === undefined) return "";
            if (typeof val === 'string') return val;
            if (typeof val !== 'object') return String(val);

            // If it's an object, try to find a text field or join all standard values
            const values = Object.values(val).map(v => (typeof v === 'object' ? JSON.stringify(v) : v));
            return values.join(". ");
        };

        // Ensure primary fields are strictly sanitized
        parsedResponse.summary = flattenToString(parsedResponse.summary);

        const sanitizeArray = (arr) => {
            if (!Array.isArray(arr)) return ["Data unavailable"];
            return arr.map(item => flattenToString(item));
        };

        parsedResponse.strengths = sanitizeArray(parsedResponse.strengths);
        parsedResponse.weaknesses = sanitizeArray(parsedResponse.weaknesses);
        parsedResponse.roadmap = sanitizeArray(parsedResponse.roadmap);
        // -------------------------------------

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'generated',
            entity: 'AI Feedback',
            role: req.user.role
        });

        res.status(200).json(parsedResponse);

    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500);
        throw new Error(error.message || 'AI Service failed');
    }
});

module.exports = {
    generateFeedback
};
