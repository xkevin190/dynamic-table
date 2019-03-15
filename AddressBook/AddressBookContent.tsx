import React from 'react';
import { Card, TableCell, IconButton, Avatar } from '@material-ui/core';
import { observer } from 'mobx-react';
import CardNavigation from '../../components/CardNavigation';
import { wallets } from '../../wallets';
import { Label } from '../../types/wallets';
import { CoinCode } from '../../consts/coins';
import DatabaseCollectionEntry from '../../types/DatabaseCollectionEntry';
import Table, { ColumnDefinition } from '../../components/Table';
import SearchComponent from '../../components/Search';
import { alertRemove, prompt } from '../../utils/dialogs';
import DividerBorder from '../../components/DividerBorder';

export type AddressBookEntry = {
  code: CoinCode;
  addressBook: Label;
};

@observer
export default class AddressBookContent extends React.Component {
  state = {
    searchText: '',
  };

  async deleteAddress(code: CoinCode, address: string) {
    const message = 'Are you sure you want to delete this account?';
    if (await alertRemove(message, 'Delete account', 'Delete')) {
      const wallet = wallets.find(wallet => wallet.code === code);
      const index = wallet!.info.addressBook.findIndex(index => index.address === address);
      wallet!.info.addressBook.splice(index, 1);
    }
  }

  editLabel = async (label: string, code: CoinCode) => {
    const name = await prompt('Address name', 'Rename Address', 'Save', label, {
      width: 370,
      height: 340,
    });
    const wallet = wallets.find(wallet => wallet.code === code);
    const index = wallet!.info.addressBook.findIndex(index => index.label === label);
    if (typeof name === 'string') {
      wallet!.info.addressBook[index].label = name;
    }
  };

  render() {
    const { searchText } = this.state;
    const transactionEntries: DatabaseCollectionEntry<AddressBookEntry>[] = [];
    for (const wallet of wallets) {
      transactionEntries.push(
        ...wallet.info.addressBook.map(addresses => ({
          document: { code: wallet.code, addressBook: addresses },
        }))
      );
    }

    const transformedSearchText = searchText.trim().toLowerCase();
    const filteredAddressBook = transformedSearchText
      ? transactionEntries.filter(item => {
          return (
            item.document.addressBook.address.toLowerCase().includes(transformedSearchText) ||
            item.document.addressBook.label.toLowerCase().includes(transformedSearchText)
          );
        })
      : transactionEntries;

    filteredAddressBook.sort((a, b) =>
      b.document.addressBook.label.localeCompare(a.document.addressBook.label)
    );

    const columns: ColumnDefinition<DatabaseCollectionEntry<AddressBookEntry>>[] = [
      {
        label: 'Label',
        value: ({ document }) => document.addressBook.label,
        render: ({ item: { document }, cell: { value } }) => (
          <TableCell style={{ width: '25%', fontWeight: 600 }}>
            <span>{value}</span>
          </TableCell>
        ),
      },
      {
        label: 'COIN',
        value: ({ document }) => document.code,
        render: ({ item: { document }, cell: { value } }) => (
          <TableCell style={{ width: '25%' }}>
            <span>{value}</span>
          </TableCell>
        ),
      },
      {
        label: 'ADDRESS',
        value: ({ document }) => document.addressBook.address,
      },

      {
        render: ({ item: { document } }) => (
          <TableCell numeric>
            <IconButton
              onClick={e => {
                this.editLabel(document.addressBook.label, document.code);
              }}
            >
              <Avatar
                src={require('../../../resources/icons/edit.png')}
                imgProps={{
                  style: {
                    position: 'fixed',
                    width: 14,
                    height: 14,
                  },
                }}
                style={{ width: 14, height: 14 }}
              />
            </IconButton>
          </TableCell>
        ),
      },
      {
        render: ({ item: { document } }) => (
          <TableCell style={{ width: 20 }}>
            <IconButton
              onClick={() => this.deleteAddress(document.code, document.addressBook.address)}
            >
              <Avatar
                src={require('../../../resources/icons/delete.png')}
                imgProps={{
                  style: {
                    position: 'fixed',
                    width: 14,
                    height: 14,
                  },
                }}
                style={{ width: 14, height: 14 }}
              />
            </IconButton>
          </TableCell>
        ),
      },
    ];

    return (
      <Card style={{ display: 'flex', flexDirection: 'column' }}>
        <CardNavigation
          title="Address Book"
          fontWeight={400}
          input={
            <>
              <DividerBorder
                style={{ display: '-webkit-inline-box', verticalAlign: 'middle' }}
                height={21}
                margin={0}
              />
              <SearchComponent
                value={this.state.searchText}
                searchAction={event => {
                  this.setState({ searchText: event.target.value });
                }}
                iconPosition="end"
              />
            </>
          }
        />

        <Table
          name="AddressBook"
          withPagination
          stripedRows
          columns={columns}
          items={filteredAddressBook}
          emptyText="You don’t have any contacts in your address book"
        />
      </Card>
    );
  }
}
