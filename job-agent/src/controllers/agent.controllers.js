import agent from "../agent/agent.js";

export async function autoApply(req, res) {
    try {
        const token = req.token;
        const candidateId = req.user.id;
        const userId = req.user.id;

        const finalState = await agent.invoke(
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
