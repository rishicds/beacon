import { z } from 'zod';

export const NaturalLanguageAdminQueriesInputSchema = z.object({
  query: z.string().describe('The natural language query from the admin.'),
  dbSchema: z.string().describe('The schema of the database.'),
});
export type NaturalLanguageAdminQueriesInput = z.infer<typeof NaturalLanguageAdminQueriesInputSchema>;

export const NaturalLanguageAdminQueriesOutputSchema = z.object({
  jsonFilter: z
    .string()
    .describe('The query filter in JSON format. This will be used to query the in-memory database.'),
  results: z
    .string()
    .describe(
      'The results of the query, as a stringified JSON array of objects.'
    ),
  summary: z
    .string()
    .describe('A natural language summary of the results.'),
});
export type NaturalLanguageAdminQueriesOutput = z.infer<typeof NaturalLanguageAdminQueriesOutputSchema>;
