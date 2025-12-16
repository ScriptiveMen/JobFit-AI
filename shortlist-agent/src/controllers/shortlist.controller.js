import shortlistAgent from "../agent/shortlistAgent.js";

export async function shortlistCandidates(req, res) {
    try {
        const token = req.token;
        const { jobId, count } = req.body;

        if (!jobId || !count) {
            return res.status(400).json({
                error: "jobId and count are required",
            });
        }

        const result = await shortlistAgent.invoke(
            {
                jobId,
                countRequested: count,
            },
            {
                metadata: {
                    token,
                },
            }
        );

        if (!result) {
            return res.status(500).json({
                error: "Unexpected error occurred while shortlisting candidates.",
            });
        }

        return res.status(200).json({ result });
    } catch (err) {
        console.error("Shortlist error:", err);
        return res.status(500).json({
            error: "Failed to shortlist candidates",
        });
    }
}
