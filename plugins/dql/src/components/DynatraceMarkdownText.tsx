import dynatrace from './dynatrace.svg';
import { MarkdownContent } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';

type DynatraceMarkdownTextProps = {
  content: string;
};

export const DynatraceMarkdownText = ({
  content,
}: DynatraceMarkdownTextProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item sm={12} md={6}>
        <MarkdownContent content={content} />
      </Grid>
      <Grid item sm={12} md={6}>
        <img
          src={dynatrace}
          alt="Dynatrace Logo"
          style={{
            width: '60%',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
            opacity: 0.5,
          }}
        />
      </Grid>
    </Grid>
  );
};
