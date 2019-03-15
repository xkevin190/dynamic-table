import React from 'react';
import styled, { css } from 'styled-components';
import { TableRow as MuiTableRow, TableCell, withTheme, Theme } from '@material-ui/core';
import { TableRowProps } from '@material-ui/core/TableRow';
import { colors } from '../../consts/theme';
import { ColumnDefinition, RowValues } from './index';

// tslint:disable-next-line:no-any
type Props<T = any> = {
  columns?: ColumnDefinition<T>[];
  row?: RowValues<T>;
  theme: Theme;
  stripedRows?: boolean;
  selected?: boolean;
} & TableRowProps;

const TableRow = <T extends {}>({ columns, row, children, innerRef, ...rest }: Props<T>) => {
  return (
    <StyledMuiTableRow {...rest}>
      {columns && row
        ? columns.map(
            (column, index) =>
              column.render ? (
                React.cloneElement(
                  column.render({ item: row.item, cell: row.cells[index] }, index),
                  {
                    key: index,
                  }
                )
              ) : (
                <TableCell key={index} numeric={column.numeric}>
                  {row.cells[index].formatted}
                </TableCell>
              )
          )
        : children}
    </StyledMuiTableRow>
  );
};

const StyledMuiTableRow = styled<Props>(({ columns, row, stripedRows, theme, ...rest }) => (
  <MuiTableRow {...rest} />
))`
  border-left: 2px solid transparent !important;
  ${props =>
    props.hover &&
    props.onClick &&
    css`
      cursor: pointer;
    `};
  ${props =>
    props.selected &&
    css`
      border-left: 4px solid ${colors.colorButtom.buttonAction} !important;
    `};

  ${props =>
    props.stripedRows &&
    css`
      &:nth-child(even) {
        background: ${props.theme.overrides!.MuiExpansionPanel!.root!.backgroundColor};
      }
    `};
`;

export default withTheme()(TableRow);
