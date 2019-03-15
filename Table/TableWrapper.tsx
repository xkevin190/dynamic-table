import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';

type Props = {
  children: React.ReactNode;
} & React.HTMLProps<HTMLDivElement>;

export default function TableWrapper(props: Props) {
  const { children, className } = props;

  return <Main className={classNames(className, 'table-wrapper')}>{children}</Main>;
}

const Main = styled.div`
  overflow-y: auto;
  height: 0;
  flex: 1;
`;
