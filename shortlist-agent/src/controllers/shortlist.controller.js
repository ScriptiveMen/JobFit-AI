import shortlistAgent from "../agent/shortlistAgent.js";

export async function shortlistCandidates(req, res) {
    const token = req.token;
    const { jobId, count } = req.body;

    const result = await shortlistAgent.invoke(
        { jobId, count },
        {
            metadata: {
                token: token,
            },
        }
    );

    if (!result) {
        return res.status(500).json({
            error: "Unexpected error occurred while shortlisting candidates.",
        });
    }

    res.status(200).json({
        result,
    });
}
