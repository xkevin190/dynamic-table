import React from 'react';
import classNames from 'classnames';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { Theme } from '@material-ui/core';
import styled from 'styled-components';
import { getColor } from '../../consts/theme';
import applicationState from '../../application-state';

type Props = {
  onChangePage: (event: React.MouseEvent, page: number) => void;
  page: number;
  count: number;
  rowsPerPage: number;
  classes: {
    root: string;
  };
  theme: Theme;
  className?: string;
  completeIcons?: boolean;
  squareButtonPagination?: boolean;
};

class TablePaginationActions extends React.Component<Props> {
  handleFirstPageButtonClick = (event: React.MouseEvent) => {
    this.props.onChangePage(event, 0);
  };

  handleBackButtonClick = (event: React.MouseEvent) => {
    this.props.onChangePage(event, this.props.page - 1);
  };

  handleNextButtonClick = (event: React.MouseEvent) => {
    this.props.onChangePage(event, this.props.page + 1);
  };

  handleLastPageButtonClick = (event: React.MouseEvent) => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1)
    );
  };

  render() {
    const {
      classes,
      className,
      count,
      page,
      rowsPerPage,
      theme,
      completeIcons = false,
    } = this.props;

    return (
      <div className={classNames(classes.root, className)}>
        {completeIcons && (
          <ButtonVariant
            theme={applicationState.preferences.theme}
            onClick={this.handleFirstPageButtonClick}
            disabled={page === 0}
            aria-label="First Page"
          >
            {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
          </ButtonVariant>
        )}
        <ButtonVariant
          theme={applicationState.preferences.theme}
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </ButtonVariant>
        <ButtonVariant
          theme={applicationState.preferences.theme}
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Next Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </ButtonVariant>
        {completeIcons && (
          <ButtonVariant
            theme={applicationState.preferences.theme}
            onClick={this.handleLastPageButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            aria-label="Last Page"
          >
            {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
          </ButtonVariant>
        )}
      </div>
    );
  }
}
const ButtonVariant = styled(IconButton)`
  && {
    background-color: ${props => getColor(props.theme).actionPaginator};
    border-radius: unset;
    margin-left: 4px;
    width: 25px;
    height: 26px;
  }
`;

export default TablePaginationActions;
