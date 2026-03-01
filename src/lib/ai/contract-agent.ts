import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();

const RiskFlagSchema = z.object({
	category: z.enum([
		"perpetuity",
		"excessive_commission",
		"lifetime_agreement",
		"missing_buyout",
		"broad_exclusivity",
		"liquidated_damages",
		"missing_payment_terms",
		"ip_rights_overcapture",
		"other",
	]),
	severity: z.enum(["critical", "high", "medium", "low"]),
	clauseText: z.string().describe("Exact quoted text from the contract"),
	explanation: z.string().describe("Plain-English explanation of why this is risky"),
	recommendation: z.enum(["accept", "negotiate", "reject_seek_attorney"]),
});

const ContractAnalysisSchema = z.object({
	overallRisk: z.enum(["low", "medium", "high", "critical"]),
	attorneyRecommended: z.boolean(),
	summary: z.string().describe("2-3 sentence plain-English contract summary"),
	flags: z.array(RiskFlagSchema),
	disclaimer: z
		.string()
		.default(
			"This analysis is for informational purposes only and does not constitute legal advice. Consult a licensed sports attorney for legal guidance.",
		),
});

export type ContractAnalysis = z.infer<typeof ContractAnalysisSchema>;

const SYSTEM_PROMPT = `You are Contract Guard, an expert NIL (Name, Image, Likeness) contract analyst for college and high school athletes. Your job is to review athlete contracts and identify predatory or unfavorable clauses.

Analyze contracts for these risk categories:
- perpetuity: clauses granting rights "in perpetuity" or forever
- excessive_commission: agent/manager commission above 10% of earnings
- lifetime_agreement: multi-year or career-length exclusivity
- missing_buyout: no exit terms or buyout clause defined
- broad_exclusivity: prevents all competing brand deals in a category
- liquidated_damages: penalties above $50,000 for breach or transfer
- missing_payment_terms: no payment schedule, milestone, or due date
- ip_rights_overcapture: athlete loses rights to their own content/likeness
- other: any other materially unfavorable clause

Return structured JSON only. Be thorough — athletes' financial futures depend on accurate analysis. When in doubt, flag it.`;

export async function analyzeContract(input: {
	fileName: string;
	rawText?: string;
	pdfBase64?: string;
}): Promise<ContractAnalysis> {
	const userContent: Anthropic.MessageParam["content"] = [];

	if (input.pdfBase64) {
		userContent.push({
			type: "document",
			source: {
				type: "base64",
				media_type: "application/pdf",
				data: input.pdfBase64,
			},
		} as Anthropic.DocumentBlockParam);
	}

	if (input.rawText) {
		userContent.push({
			type: "text",
			text: `Contract text:\n\n${input.rawText}`,
		});
	}

	if (userContent.length === 0) {
		throw new Error("Must provide either pdfBase64 or rawText");
	}

	userContent.push({
		type: "text",
		text: "Analyze this NIL contract and identify all risky clauses. Return your analysis in the required JSON format.",
	});

	// zodOutputFormat returns an AutoParseableOutputFormat; the response is a
	// ParsedMessage<ContractAnalysis> with a .parsed_output field.
	const response = await client.messages.create({
		model: "claude-sonnet-4-6",
		max_tokens: 4096,
		system: SYSTEM_PROMPT,
		output_config: {
			format: zodOutputFormat(ContractAnalysisSchema),
		},
		messages: [{ role: "user", content: userContent }],
	});

	const parsed = (response as { parsed_output?: ContractAnalysis }).parsed_output;
	if (!parsed) throw new Error("Claude returned no structured output");
	return parsed;
}
