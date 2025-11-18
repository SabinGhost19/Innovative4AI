/**
 * Report Agent (with RAG)
 * 
 * Generates comprehensive monthly narrative report.
 * Uses historical context from RAG to provide trend analysis and contextual insights.
 * 
 * Model: gpt-4o (smart model for narrative generation)
 * Output: Structured monthly report with insights and recommendations
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { LLM_CONFIG } from '../../core/constants';
import type { HistoricalContext } from '../services/rag-service';

// Report schema
export const MonthlyReportSchema = z.object({
  executive_summary: z.string().describe('2-3 sentence overview of the month'),
  
  financial_highlights: z.object({
    revenue_summary: z.string(),
    profit_summary: z.string(),
    key_metrics: z.array(z.string()).max(4),
  }),
  
  performance_analysis: z.object({
    what_went_well: z.array(z.string()).max(3),
    challenges_faced: z.array(z.string()).max(3),
    trend_vs_last_month: z.string(),
  }),
  
  market_insights: z.object({
    customer_behavior: z.string(),
    competition_update: z.string(),
    external_factors_impact: z.string(), // Events + Trends
  }),
  
  recommendations: z.array(z.object({
    category: z.enum(['pricing', 'marketing', 'hiring', 'operations', 'strategy']),
    priority: z.enum(['high', 'medium', 'low']),
    action: z.string(),
    expected_impact: z.string(),
    reasoning: z.string(),
  })).min(3).max(5),
  
  next_month_outlook: z.object({
    predicted_trend: z.enum(['improving', 'stable', 'declining']),
    key_opportunities: z.array(z.string()).max(3),
    key_risks: z.array(z.string()).max(3),
  }),
});

export type MonthlyReport = z.infer<typeof MonthlyReportSchema>;

export interface ReportAgentInput {
  // Business context
  businessType: string;
  location: { neighborhood: string; county: string };
  currentMonth: number;
  currentYear: number;
  
  // All agent outputs
  marketContext: any;
  eventsData: any;
  trendsData: any;
  supplierData: any;
  competitionData: any;
  customerData: any;
  employeeData: any;
  financialData: any;
  
  // Historical context from RAG
  historicalContext: HistoricalContext;
}

/**
 * Generate comprehensive monthly report with RAG context
 */
export async function generateMonthlyReport(input: ReportAgentInput): Promise<MonthlyReport> {
  
  const { historicalContext } = input;
  
  // Build historical summary
  const historicalSummary = buildHistoricalSummary(historicalContext);
  
  const systemPrompt = `You are an expert business consultant providing monthly performance reports.
Your reports are insightful, data-driven, and actionable.

IMPORTANT GUIDELINES:
1. **Compare with History**: Reference past months when relevant
2. **Identify Patterns**: Spot trends across multiple months
3. **Be Specific**: Use exact numbers and percentages
4. **Action-Oriented**: Every recommendation must be concrete and implementable
5. **Context-Aware**: Consider seasonal patterns, events, and market conditions
6. **Balanced**: Mention both positives and challenges

STYLE:
- Professional but conversational
- Use data to support every claim
- Avoid generic advice - be specific to THIS business
- Reference historical context when making recommendations`;

  const userPrompt = `Generate monthly performance report for:

🏢 **BUSINESS CONTEXT**
- Type: ${input.businessType}
- Location: ${input.location.neighborhood}, ${input.location.county}
- Month: ${input.currentMonth}/${input.currentYear}

📊 **THIS MONTH'S PERFORMANCE**

**Financial Summary:**
- Revenue: $${input.financialData.profit_loss.revenue.toLocaleString()}
- Net Profit: $${input.financialData.profit_loss.net_profit.toLocaleString()}
- Profit Margin: ${input.financialData.profit_loss.profit_margin.toFixed(1)}%
- Cash Balance: $${input.financialData.cash_flow.closing_balance.toLocaleString()}
- Revenue Growth: ${input.financialData.health_metrics.revenue_growth_rate > 0 ? '+' : ''}${input.financialData.health_metrics.revenue_growth_rate.toFixed(1)}%

**Cost Breakdown:**
- Labor: $${input.financialData.cost_breakdown.labor.toLocaleString()} (${((input.financialData.cost_breakdown.labor / input.financialData.profit_loss.revenue) * 100).toFixed(0)}%)
- Inventory/COGS: $${input.financialData.cost_breakdown.inventory.toLocaleString()} (${((input.financialData.cost_breakdown.inventory / input.financialData.profit_loss.revenue) * 100).toFixed(0)}%)
- Rent: $${input.financialData.cost_breakdown.rent.toLocaleString()}
- Marketing: $${input.financialData.cost_breakdown.marketing.toLocaleString()}

**Customer Metrics:**
- Total Active Customers: ${input.customerData.total_active_customers.toLocaleString()}
- New Customers: ${input.customerData.new_customers_acquired.toLocaleString()}
- Churned: ${input.customerData.churned_customers}
- Avg Transaction: $${input.customerData.avg_transaction_value.toFixed(2)}
- Visit Frequency: ${input.customerData.avg_visit_frequency.toFixed(1)}x/month

**Operations:**
- Employees: ${input.employeeData.total_employees}
- Productivity Score: ${input.employeeData.productivity_score}/100
- Customers per Employee: ${(input.customerData.total_active_customers / input.employeeData.total_employees).toFixed(0)}

**Market Conditions:**
- Economic Climate: ${input.marketContext.economic_climate}
- Industry Saturation: ${input.marketContext.industry_saturation}%
- Competitors: ${input.competitionData.total_competitors}
- Market Space: ${input.competitionData.market_space}

**External Factors:**
- Event Impact: ${input.eventsData.nume_eveniment} (${input.eventsData.impact_clienti_lunar > 0 ? '+' : ''}${input.eventsData.impact_clienti_lunar}%)
- Trend: ${input.trendsData.main_trend.trend_name} (impact: ${input.trendsData.main_trend.impact_score})
- Trend Momentum: ${input.trendsData.market_momentum}

📈 **HISTORICAL CONTEXT**
${historicalSummary}

---

**YOUR TASK:**

Generate a comprehensive monthly report that:

1. **Summarizes Performance**: How did this month compare to past months?
2. **Explains WHY**: What drove the results (positive or negative)?
3. **Identifies Patterns**: Are there recurring trends?
4. **Provides Recommendations**: 3-5 specific actions ranked by priority
5. **Forecasts Next Month**: What should the owner expect?

Be specific, use the data, and reference historical context where relevant.`;

  const result = await generateObject({
    model: openai(LLM_CONFIG.SMART_MODEL),
    schema: MonthlyReportSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: LLM_CONFIG.BALANCED,
  });

  return result.object;
}

/**
 * Build historical summary from RAG context
 */
function buildHistoricalSummary(context: HistoricalContext): string {
  if (!context || context.recent_months.length === 0) {
    return 'No historical data available (first month of operation).';
  }
  
  const summaries: string[] = [];
  
  // Recent months summary
  if (context.recent_months.length > 0) {
    summaries.push('**Recent Months:**');
    context.recent_months.slice(0, 3).forEach((month: any) => {
      summaries.push(`- Month ${month.month}: Revenue $${month.revenue?.toLocaleString() || 'N/A'}, Profit $${month.profit?.toLocaleString() || 'N/A'} (${month.summary_text ? month.summary_text.split('\n')[0] : 'No summary'})`);
    });
  }
  
  // Similar situations
  if (context.similar_situations.length > 0) {
    summaries.push('\n**Similar Past Situations:**');
    context.similar_situations.slice(0, 2).forEach((situation: any) => {
      summaries.push(`- Month ${situation.month}: ${situation.summary_text?.split('\n')[0] || 'N/A'} (similarity: ${(situation.similarity_score * 100).toFixed(0)}%)`);
    });
  }
  
  // Past recommendations
  if (context.past_recommendations.length > 0) {
    summaries.push('\n**Past Recommendations & Outcomes:**');
    context.past_recommendations.slice(0, 3).forEach((rec: any) => {
      summaries.push(`- ${rec.category}: "${rec.recommendation_text}" → ${rec.implemented ? `Implemented (impact: ${rec.outcome_impact > 0 ? '+' : ''}${rec.outcome_impact})` : 'Not implemented'}`);
    });
  }
  
  return summaries.join('\n');
}
