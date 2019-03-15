import React from 'react';
import styled from 'styled-components';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { withTheme, Theme } from '@material-ui/core';

type Props = IconButtonProps & { theme: Theme; contianer?: boolean };

function TableCellButton(props: Props) {
  const { children, theme, innerRef, contianer, ...rest } = props;

  if (contianer) {
    return (
      <StyledIconButtonVariant theme={theme} {...rest}>
        {children}
      </StyledIconButtonVariant>
    );
  }

  return (
    <StyledIconButton theme={theme} {...rest}>
      {children}
    </StyledIconButton>
  );
}

export default withTheme()(TableCellButton);

const StyledIconButton = styled<Props>(({ theme, ...rest }: Props) => <IconButton {...rest} />)`
  width: initial !important;
  height: initial !important;
  margin-top: -3px !important;

  &:not(:first-child) {
    margin-left: 8px !important;
  }
  svg {
    width: 11px !important;
    height: 11px !important;
    &:not(:hover) {
      color: ${(props: Props) => props.theme.palette.text.secondary};
    }
  }
`;

const StyledIconButtonVariant = styled<Props>(({ theme, contianer, ...rest }: Props) => (
  <div {...rest} />
))`
  margin: auto;
  display: inline;
  width: initial !important;
  height: initial !important;
  margin-top: -3px !important;
  float: right;
  &:not(:first-child) {
    margin-left: 8px !important;
  }
  }
`;
