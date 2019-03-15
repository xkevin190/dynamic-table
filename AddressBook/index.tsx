import React from 'react';
import styled from 'styled-components';
import { sizes } from '../../consts/theme';
import ContentContainer from '../../components/ContentContainer';
import AddressBookContent from './AddressBookContent';
import SaveAddressPanel from './SaveAddressPanel';

export default class AddressBook extends React.PureComponent<React.HTMLProps<HTMLDivElement>> {
  render() {
    const { ref, ...rest } = this.props;

    return (
      <ContentContainer>
        <Main {...rest}>
          <SaveAddressPanel />
          <AddressBookContent />
        </Main>
      </ContentContainer>
    );
  }
}

const Main = styled.div`
  display: grid;
  grid-template-columns: 0fr 4fr;
  grid-template-rows: 100%;
  grid-template-areas: 'SaveAddressPanel AddressBookContent';
  grid-gap: ${sizes.sectionSpacing}px;
`;
