/**
 * @license
 * Copyright 2024 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { CodeSnippet } from '@backstage/core-components';
import {
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle as MuiDialogTitle,
  IconButton,
  Link,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React, { useState } from 'react';

export type ObjectModalProps = {
  data: string;
  property: string;
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    flex: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing(2),
    },
    closeButton: {
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}
const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <div className={classes.flex}>
        <Typography variant="h6">{children}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={() => onClose()}
        >
          <CloseIcon />
        </IconButton>
      </div>
    </MuiDialogTitle>
  );
});

export const ObjectModal = ({ data, property }: ObjectModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onComplexRecordClick = () => {
    setIsOpen(true);
  };

  const onModalClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Link
        component="button"
        variant="body2"
        onClick={() => onComplexRecordClick()}
        style={{ minWidth: '120px' }}
      >
        Complex record
      </Link>
      <Dialog
        open={isOpen}
        onClose={() => onModalClose()}
        aria-labelledby={'object-dialog-title'}
      >
        <DialogTitle id="object-dialog-title" onClose={onModalClose}>
          Complex record of "{property}"
        </DialogTitle>
        <DialogContent dividers>
          <CodeSnippet text={data} language={'json'} />
        </DialogContent>
      </Dialog>
    </>
  );
};
