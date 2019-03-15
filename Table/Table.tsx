import React from 'react';
import { autorun, IReactionDisposer } from 'mobx';
import {
  Table as MuiTable,
  TableHead,
  TableCell,
  TableBody,
  TableSortLabel,
  Icon,
  withTheme,
  Theme,
  TablePagination,
  Grid,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';
import { TableProps } from '@material-ui/core/Table';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import zIndex from '../../consts/z-index';
import Text from '../Text';
import TablePaginationActions from './ActionsPaginator';
import TableRow from './TableRow';

const actionsStyles = (theme: Theme) => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
});

const TablePaginationActionsWrapped = withStyles(actionsStyles, { withTheme: true })(
  TablePaginationActions
);

// tslint:disable-next-line:no-any
export type ColumnDefinition<T, F extends (item: T) => any = (item: T) => any> = {
  label?: string;
  noSort?: boolean;
  numeric?: boolean;
  value?: F;
  format?: (value: ReturnType<F>, item: T) => string;
  render?: (row: { item: T; cell: CellValues<T> }, index: number) => JSX.Element;
};

type IconProps = {
  theme: Theme;
};

const Sort = withTheme()((props: IconProps) => (
  <IconSmall className={classNames('fa-layers')}>
    <i
      className={classNames('fas', 'fa-sort-up')}
      style={{ color: props.theme.palette.text.disabled }}
    />
    <i
      className={classNames('fas', 'fa-sort-down')}
      style={{ color: props.theme.palette.text.disabled }}
    />
  </IconSmall>
));

const SortAsc = withTheme()((props: IconProps) => (
  <IconSmall className={classNames('fa-layers')}>
    <i className={classNames('fas', 'fa-sort-up')} />
    <i
      className={classNames('fas', 'fa-sort-down')}
      style={{ color: props.theme.palette.text.disabled }}
    />
  </IconSmall>
));

const SortDesc = withTheme()((props: IconProps) => (
  <IconSmall className={classNames('fa-layers')}>
    <i
      className={classNames('fas', 'fa-sort-up')}
      style={{ color: props.theme.palette.text.disabled }}
    />
    <i className={classNames('fas', 'fa-sort-down')} />
  </IconSmall>
));

export type CellValues<T> = {
  value: string | number | null;
  formatted: string;
};

// tslint:disable-next-line:no-any
export type RowValues<T = any> = {
  item: T;
  cells: CellValues<T>[];
};

// tslint:disable-next-line:no-any
type Props<T = any> = {
  name?: string;
  columns?: ColumnDefinition<T>[];
  items?: T[];
  // tslint:disable-next-line:no-any
  keyFunc?: (item: T) => any;
  render?: (row: RowValues<T>, index: number) => JSX.Element;
  stickyHeaders?: boolean;
  canSort?: boolean;
  sortBy?: number;
  stripedRows?: boolean;
  compact?: boolean;
  filter?: string;
  withPagination?: boolean;
  rowsPerPage?: number;
  emptyText?: string;
  definitionForTable?: string;
  squareButtonPagination?: boolean;
  headStyle?: React.CSSProperties;
  headSpacer?: number;
  smallRow?: boolean;
} & TableProps;

// tslint:disable-next-line:no-any
type State<T = any> = {
  mobxRan: boolean;
  items?: T[];
  rows: RowValues<T>[];
  sortedRows: RowValues<T>[];
  filteredRows: RowValues<T>[];
  sortBy?: number;
  sortOrder: 'asc' | 'desc';
  page: number;
  rowsPerPage: number;
};

function makeRowValues<T>(columns: ColumnDefinition<T>[], items: T[]) {
  return items.map(item => ({
    item,
    cells: columns.map(column => {
      const value =
        typeof column.value !== 'undefined' ? (column.value(item) as string | number) : null;
      return {
        value,
        formatted:
          typeof column.format !== 'undefined'
            ? column.format(value, item)
            : value !== null
              ? value.toString()
              : '',
      };
    }),
  }));
}

@observer
export default class Table<T> extends React.Component<Props<T>, State<T>> {
  disposer: IReactionDisposer | null = null;

  constructor(props: Props<T>) {
    super(props);
    this.state = {
      mobxRan: false,
      rows: [],
      sortedRows: [],
      filteredRows: [],
      sortBy: props.sortBy,
      sortOrder: 'desc',
      page: 0,
      rowsPerPage: this.props.rowsPerPage || 10,
    };
  }

  componentDidMount() {
    this.disposer = autorun(() => {
      const { columns, items } = this.props;
      if (columns && items) {
        const rows = makeRowValues(columns, items);
        this.setState({
          rows,
          sortedRows: rows.slice(),
          filteredRows: rows.slice(),
          mobxRan: true,
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.disposer) {
      this.disposer();
    }
  }

  componentDidUpdate(prevProps: Props<T>, prevState: State) {
    const { mobxRan } = this.state;

    const newState: Partial<State> = {
      mobxRan: false,
      rows: this.state.rows.slice(),
      sortedRows: this.state.sortedRows.slice(),
      filteredRows: this.state.filteredRows.slice(),
    };

    let rowsRegenerated = mobxRan;
    let rowsSorted = false;
    let rowsFiltered = false;
    let pageReset = false;

    if (
      !rowsRegenerated &&
      (this.props.columns && this.props.items && this.props.items !== prevProps.items)
    ) {
      rowsRegenerated = true;

      newState.rows = makeRowValues(this.props.columns, this.props.items);
      newState.sortedRows = newState.rows.slice();
      newState.filteredRows = newState.rows!.slice();
    }

    if (
      this.props.canSort &&
      this.props.columns &&
      (rowsRegenerated ||
        prevState.sortBy !== this.state.sortBy ||
        prevState.sortOrder !== this.state.sortOrder)
    ) {
      rowsSorted = true;

      if (
        typeof this.state.sortBy !== 'undefined' &&
        typeof this.props.columns[this.state.sortBy].value !== 'undefined'
      ) {
        newState.sortedRows!.sort((a, b) => {
          const column = this.props.columns![this.state.sortBy!];
          const getValue = (r: RowValues) => {
            const v = r.cells[this.state.sortBy!][column.numeric ? 'value' : 'formatted'];
            let value = v !== null ? v : column.numeric ? 0 : '';
            if (!column.numeric) {
              value = value.toString().toUpperCase();
            }
            return value;
          };
          const vA = getValue(a);
          const vB = getValue(b);
          if (vA === vB) {
            return 0;
          } else {
            if (this.state.sortOrder === 'desc') {
              if (vA < vB) {
                return -1;
              } else {
                return 1;
              }
            } else {
              if (vA > vB) {
                return -1;
              } else {
                return 1;
              }
            }
          }
        });
      } else {
        newState.sortedRows = newState.rows!.slice();
      }
    }

    if (this.props.filter !== prevProps.filter || rowsRegenerated || rowsSorted) {
      rowsFiltered = true;

      const tokens = (this.props.filter || '')
        .split(' ')
        .map(p => p.trim().toUpperCase())
        .filter(p => p);
      if (tokens.length > 0) {
        newState.filteredRows = newState.sortedRows!.filter(row => {
          const allText = row.cells
            .map(cell => cell.formatted)
            .join(' ')
            .toUpperCase();
          return tokens.every(token => allText.includes(token));
        });
      } else {
        newState.filteredRows = newState.sortedRows!.slice();
      }
    }

    if (
      this.props.withPagination &&
      this.state.page > 0 &&
      (prevState.rowsPerPage !== this.state.rowsPerPage ||
        Math.ceil(newState.filteredRows!.length / this.state.rowsPerPage) < this.state.page)
    ) {
      pageReset = true;
      newState.page = 0;
    }

    if (rowsRegenerated || rowsSorted || rowsFiltered || pageReset) {
      this.setState(newState as State);
    }
  }

  handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = event => {
    this.setState({ rowsPerPage: Number(event.target.value) });
  };

  sort = (index: number) => {
    let sortBy: number | undefined = index;
    let sortOrder: 'asc' | 'desc';
    if (this.state.sortBy === index) {
      if (this.state.sortOrder === 'desc') {
        sortOrder = 'asc';
      } else {
        sortOrder = 'desc';
        sortBy = undefined;
      }
    } else {
      sortOrder = 'desc';
    }
    this.setState({
      sortBy,
      sortOrder,
    });
  };

  render() {
    const {
      columns,
      items,
      keyFunc,
      render,
      stickyHeaders,
      canSort,
      innerRef,
      withPagination,
      stripedRows,
      compact,
      children,
      emptyText,
      definitionForTable,
      squareButtonPagination,
      headStyle,
      headSpacer,
      smallRow,
      ...rest
    } = this.props;
    const { sortBy, sortOrder, page, rowsPerPage, filteredRows } = this.state;

    let pageRows = filteredRows;

    if (withPagination) {
      pageRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }

    return (
      <Main className="table-container">
        <StyledMuiTable compact={compact} smallRow={smallRow} {...delete rest.rowsPerPage}>
          {columns ? (
            <>
              <TableHead>
                <CleanRow style={headStyle}>
                  {columns.map((column, index) => {
                    return (
                      <TableCell
                        key={index}
                        numeric={column.numeric}
                        style={
                          stickyHeaders
                            ? { position: 'sticky', top: 0, zIndex: zIndex.StickyHeader }
                            : {}
                        }
                        sortDirection={sortBy === index ? sortOrder : false}
                      >
                        {canSort && typeof column.value !== 'undefined' ? (
                          !column.noSort ? (
                            <TableSortLabel
                              active={sortBy === index}
                              direction={sortOrder || 'asc'}
                              onClick={() => this.sort(index)}
                              IconComponent={
                                sortBy !== index ? Sort : sortOrder === 'asc' ? SortAsc : SortDesc
                              }
                            >
                              {column.label}
                            </TableSortLabel>
                          ) : (
                            column.label
                          )
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    );
                  })}
                </CleanRow>
                {headSpacer && (
                  <TableRow style={{ height: headSpacer }}>
                    <></>
                  </TableRow>
                )}
              </TableHead>
              <TableBody>
                {pageRows.length === 0 &&
                  emptyText && (
                    <tr>
                      <td colSpan={columns.length}>
                        <Grid
                          container
                          justify="center"
                          alignItems="center"
                          style={{ height: 480 }}
                        >
                          <Grid item>
                            <Text weight={500} family="Roboto" size={12} color="textSecondary">
                              {emptyText}
                            </Text>
                          </Grid>
                        </Grid>
                      </td>
                    </tr>
                  )}
                {pageRows.map(
                  (row, index) => 
                    render ? (
                      React.cloneElement(render(row, index), { columns })
                    ) : (
                      <TableRow
                        key={keyFunc ? keyFunc(row.item) : index}
                        row={row}
                        stripedRows={stripedRows}
                        columns={columns}
                      />
                    )
                )}
              </TableBody>
            </>
          ) : (
            children
          )}
        </StyledMuiTable>
        {withPagination &&
          filteredRows.length >= rowsPerPage && (
            <div className="pagination">
              <TablePagination
                component="div"
                count={filteredRows.length}
                rowsPerPage={rowsPerPage}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} of ${count} ${definitionForTable ? definitionForTable : ''}`
                }
                page={page}
                onChangePage={this.handleChangePage}
                rowsPerPageOptions={[]}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActionsWrapped}
              />
            </div>
          )}
      </Main>
    );
  }
}

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  > .pagination {
    padding-right: 20px;
    margin-top: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
`;

const StyledMuiTable = styled<TableProps & { compact?: boolean; smallRow?: boolean }>(
  ({ compact, innerRef, smallRow, ...rest }) => <MuiTable {...rest} />
)`
  ${props =>
    props.compact
      ? props.smallRow
        ? css`
            tr {
              height: 20px;
            }
          `
        : css`
            tr {
              height: 25px;
            }
          `
      : ``};
`;

const IconSmall = styled(Icon)`
  > .svg-inline--fa {
    width: 7px !important;
  }
`;

const CleanRow = styled(TableRow)`
  && {
    border: none !important;
  }
`;
