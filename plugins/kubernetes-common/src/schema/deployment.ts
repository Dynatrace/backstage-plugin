import { z } from 'zod';

const deploymentSchema = z.object({
  name: z.string(),
  namespace: z.string().default('default'),
});

export function fromString(input: string): Deployment {
  const data = JSON.parse(input);
  return fromObject(data);
}

export function fromObject(input: any): Deployment {
  return deploymentSchema.parse(input);
}

export type Deployment = z.infer<typeof deploymentSchema>;
