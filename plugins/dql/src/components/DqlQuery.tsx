import { InternalDqlQuery } from './InternalDqlQuery';
import { ErrorPanel } from '@backstage/core-components';
import React from 'react';
import { ZodError, z } from 'zod';

const namespaceSchema = z.enum(['dynatrace', 'custom']);
const queryNameSchema = z.string().regex(/^[a-z1-9\-]+$/);

const dqlQueryPropsSchema = z.strictObject({
  title: z.string().default('Query Result'),
  queryId: z
    .string()
    .toLowerCase()
    .refine(
      value => {
        // Check the namespace and queryName separately
        const [namespace, queryName] = value.split('.');
        return (
          namespaceSchema.safeParse(namespace).success &&
          queryNameSchema.safeParse(queryName).success
        );
      },
      {
        message:
          "String must be in the format 'namespace.query-name'. Namespace must be 'dynatrace' or 'custom'. Query name may only contain alphanumerics and dashes.",
      },
    ),
});

export type DqlQueryProps = z.infer<typeof dqlQueryPropsSchema>;

/**
 * DqlQuery is a wrapper around InternalDqlQuery that provides error handling
 * for invalid props.
 * @param props DqlQueryProps
 * @returns React.ReactElement either a InternalDqlQuery or an ErrorPanel
 */
export const DqlQuery = (props: DqlQueryProps) => {
  try {
    const { title, queryId } = dqlQueryPropsSchema.parse(props);
    const [queryNamespace, queryName] = queryId.split('.');
    return (
      <InternalDqlQuery
        title={title}
        queryNamespace={queryNamespace}
        queryName={queryName}
      />
    );
  } catch (e) {
    if (e instanceof ZodError) {
      const title = `${e.issues[0].path.join('.')}: ${e.issues[0].message}`;
      return <ErrorPanel error={e} title={title} />;
    }
    return <ErrorPanel error={new Error(`Unknown error: ${e}`)} />;
  }
};
