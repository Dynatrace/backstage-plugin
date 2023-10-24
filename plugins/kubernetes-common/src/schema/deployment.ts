import { z } from 'zod';

const deploymentSchema = z.object({
  name: z.string(),
  namespace: z.string().default('default'),
});

export const DeploymentFactory = {
  fromString: (input: string): Deployment => {
    const data = JSON.parse(input);
    return DeploymentFactory.fromObject(data);
  },

  fromObject: deploymentSchema.parse,
};

export type Deployment = z.infer<typeof deploymentSchema>;
