import applyAgent from "../agent/applyAgent.js";
import getResumeSuggestions from "../agent/resumeSuggestionAgent.js";

export async function autoApply(req, res) {
    try {
        const token = req.token;
        const candidateId = req.user.id;
        const userId = req.user.id;

        const finalState = await applyAgent.invoke(
            { candidateId, userId },
            {
                metadata: {
                    token: token,
                },
            }
        );

        return res.status(200).json({
            decision: finalState.decision,
            application: finalState.application,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function resumeSuggestions(req, res) {
    try {
        const token = req.token;
        const candidateId = req.user.id;
        const { jobId } = req.params;

        const suggestions = await getResumeSuggestions({
            candidateId,
            jobId,
            token,
        });

        return res.status(200).json({ suggestions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate suggestions" });
    }
}
