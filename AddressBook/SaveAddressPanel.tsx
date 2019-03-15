import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  CardActions,
  Button,
  InputLabel,
} from '@material-ui/core';
import * as yup from 'yup';
import { FormikProps, Formik, FormikActions } from 'formik';
import styled from 'styled-components';
import { Field } from '../../components/forms/Field';
import CardNavigation from '../../components/CardNavigation';
import { wallets } from '../../wallets';
import { getCoinInfo } from '../../utils/coins';
import { CoinCode } from '../../consts/coins';
import loading from '../../utils/loading';
import Text from '../../components/Text';

type Values = {
  label: string;
  address: string;
  code: CoinCode;
};

const initialValues = {
  label: '',
  address: '',
  code: wallets[0].code,
};

const validationSchema = yup.object().shape({
  label: yup
    .string()
    .label('Label')
    .required()
    .max(60),
  address: yup
    .string()
    .label('Wallet address')
    .required(),
});

export default class SaveAddressPanel extends React.Component {
  resetForm: (values: Values) => void;

  handleSubmit = async ({ label, address, code }: Values, { resetForm }: FormikActions<Values>) => {
    const wallet = wallets.find(wallet => wallet.code === code);
    await loading(() => {
      wallet!.saveToAddressBook({ label, address });
    });
    resetForm(initialValues);
  };

  render() {
    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.handleSubmit}
        validationSchema={validationSchema}
        render={({ values, handleSubmit, resetForm, setFieldValue }: FormikProps<Values>) => {
          this.resetForm = resetForm;
          return (
            <Main>
              <CardNavigation title="Add contact" fontWeight={400} border />
              <CardContent>
                <Text
                  weight={400}
                  family="Roboto"
                  size={10}
                  style={{ lineHeight: '20px' }}
                  color="textPrimary"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </Text>
              </CardContent>
              <CardContent style={{ flex: 3 }}>
                <Grid container spacing={16}>
                  <Grid item xs={12}>
                    <Field
                      name="label"
                      hideAsterisk
                      label="Label"
                      element={
                        <TextField
                          InputProps={{ className: 'variantB' }}
                          placeholder="Enter label..."
                        />
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      name="address"
                      hideAsterisk
                      label="Wallet Adress"
                      element={
                        <TextField
                          InputProps={{ className: 'variantB' }}
                          placeholder="Enter address..."
                        />
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <InputLabel style={{ fontSize: 10, lineHeight: 2 }} htmlFor="name-readonly">
                      Select Wallet
                    </InputLabel>
                    <Select
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        marginTop: 6,
                        fontFamily: 'roboto',
                      }}
                      SelectDisplayProps={{ style: { fontWeight: 700 } }}
                      className="variantA"
                      fullWidth={true}
                      value={values.code}
                      onChange={event => {
                        setFieldValue('code', event.target.value);
                      }}
                    >
                      {wallets.map(coin => {
                        return (
                          <MenuItem value={coin.code} key={coin.code}>
                            {getCoinInfo(coin.code).name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions
                style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'column-reverse' }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleSubmit();
                  }}
                >
                  Add contact
                </Button>
              </CardActions>
            </Main>
          );
        }}
      />
    );
  }
}

const Main = styled(Card)`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 260px;
`;
