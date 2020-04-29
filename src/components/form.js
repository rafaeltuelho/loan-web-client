import "@patternfly/react-core/dist/styles/base.css";
import isNumeric from 'validator/lib/isNumeric';
import isCurrency from 'validator/lib/isCurrency';
import isPostalCode from 'validator/lib/isPostalCode';

import './fonts.css';

import React from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  TextArea,
  FormSelectOption,
  FormSelect,
  Checkbox,
  ActionGroup,
  Button,
  Radio,
  Divider
} from '@patternfly/react-core';

class AppForm extends React.Component {
  state = {
    fields: {
      //borrower
      borrowerName: '',
      borrowerDoB: '',
      borrowerIncome: '',
      borrowerCreditScore: '',
      isBorrowerSelfEmployed: false,
      //loan
      loanType: '',
      loanCounty: '',
      loanZipCode: '',
      loandIncomeDocumentDate: '',
    },
    fieldErrors: {},
  };

  onFormSubmit = evt => {
    //const loans = this.state.loans;
    const form = this.state.fields;
    console.debug(form);
    console.debug(evt);

    evt.preventDefault();

    if (this.validate()) return;

    this.setState({
      fields: {
        //borrower
        borrowerName: '',
        borrowerDoB: '',
        borrowerIncome: '',
        borrowerCreditScore: '',
        isBorrowerSelfEmployed: false,
        //loan
        loanType: '',
        loanCounty: '',
        loanZipCode: '',
        loandIncomeDocumentDate: '',
      }
    });
  };

  // common generic field Input Change Handler
  onInputChange = ({name, value, error}) => {
    const fields = Object.assign({}, this.state.fields);
    const fieldErrors = Object.assign({}, this.state.fieldErrors);

    fields[name] = value;
    fieldErrors[name] = error;

    this.setState({fields, fieldErrors});
  };

  // Form level validation
  validate = () => {
    const form = this.state.fields;
    const fieldErrors = this.state.fieldErrors;
    const errMessages = Object.keys(fieldErrors).filter(k => fieldErrors[k]);

    if (!form.borrowerName) return true;
    if (!form.borrowerDoB) return true;
    if (!form.borrowerIncome) return true;
    if (!form.borrowerCreditScore) return true;
    if (!form.loanType) return true;
    if (!form.loanCounty) return true;
    if (!form.loanZipCode) return true;
    if (!form.loanIncomeDocumentDate) return true;
    if (errMessages.length) return true;

    return false;
  };

  // handler for Text fields
  handleTextInputChange = (value, event) => {
    const { id } = event.currentTarget;
    console.log('handleTextInputChange Handling: ' + id + ' value = ' + value);

    const error = value ? false : 'Field Required';
    this.onInputChange({ name: id, value, error });
  };

  // handler for Radio fields
  handleRadioInputChange = (value, event) => {
    const { name } = event.currentTarget;
    console.log('handleRadioInputChange Handling: ' + name + ' value = ' + value);

    const error = value ? false : 'Field Required';
    this.onInputChange({ name, value, error });
  };  

  // handler for Select fields
  handleSelectInputChange = (value, event) => {
    const { id } = event.currentTarget;
    console.log('handleSelectInputChange Handling: ' + id + ' value = ' + value);

    const error = value ? false : 'Field Required';
    this.onInputChange({ name: id, value, error });
  };

  render() {
    const loanTypes = [
      { value: 'FHA', label: 'FHA', disabled: false },
      { value: 'CNV', label: 'Conventional', disabled: false },
      { value: 'JNB', label: 'Jumbo', disabled: false },
    ];
    const countyList = [
      { value: 'Broward', label: 'Broward', disabled: false },
      { value: 'Wayne', label: 'Wayne', disabled: false },
      { value: 'Alachua', label: 'Alachua', disabled: false },
      { value: 'Baker', label: 'Baker', disabled: false },
      { value: 'Bradford', label: 'Bradford', disabled: false },
    ];
    const dateRegex = /(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/;

    return (
      <Form isHorizontal>
        {/** Borrower fields */}
        <FormGroup
          label="Borrower Name"
          isRequired
          fieldId="borrowerName"
          isValid={ !this.state.fields.borrowerName ? false  : true }
          helperText="Enter your Name"
          helperTextInvalid="Name must not be empty">
          <TextInput
            isRequired
            type="text"
            id="borrowerName"
            name="borrowerName"
            isValid={ !this.state.fields.borrowerName ? false  : true }
            value={this.state.fields.borrowerName}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        <FormGroup 
          label="Date of Birth" 
          isRequired={false} 
          fieldId="borrowerDoB"
          isValid={ dateRegex.test(this.state.fields.borrowerDoB) }
          helperText="Enter your Date of Birth"
          helperTextInvalid="DoB must a valid Date">
          <TextInput
            isRequired={false}
            type="date"
            id="borrowerDoB"
            name="borrowerDoB"
            placeholder='MM/DD/YYYY'
            isValid={ dateRegex.test(this.state.fields.borrowerDoB) }
            value={this.state.fields.borrowerDoB}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        <FormGroup 
          label="Income" 
          isRequired={false} 
          fieldId="borrowerIncome"
          isValid={ isCurrency(this.state.fields.borrowerIncome) }
          helperText="Enter your yearly income "
          helperTextInvalid="Income must be a valid currency value">
          <TextInput
            isRequired
            type="number"
            id="borrowerIncome"
            placeholder="$0.00"
            name="borrowerIncome"
            isValid={ isCurrency(this.state.fields.borrowerIncome) }
            value={this.state.fields.borrowerIncome}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        <FormGroup 
          label="Credit Score" 
          isRequired 
          fieldId="borrowerCreditScore"
          isValid={ isNumeric(this.state.fields.borrowerCreditScore) }
          helperText="Enter your Credit Score "
          helperTextInvalid="Score must be a valid number '1-1000'">
          <TextInput
            isRequired
            type="number"
            id="borrowerCreditScore"
            placeholder="0-1000"
            name="borrowerCreditScore"
            isValid={ isNumeric(this.state.fields.borrowerCreditScore) }
            value={this.state.fields.borrowerCreditScore}
            onChange={ this.handleTextInputChange }
          />
        </FormGroup>
        <FormGroup 
          isInline label="Self Employed?" 
          isRequired
          fieldId="isBorrowerSelfEmployed">
          <Radio 
            name="isBorrowerSelfEmployed" 
            label="Yes" 
            id="borrowerSelfEmployedRadio"
            onChange={this.handleRadioInputChange} 
            isChecked={this.state.fields.isBorrowerSelfEmployed} 
            />
          <Radio 
            name="isBorrowerSelfEmployed" 
            label="No" 
            id="borrowerNotSelfEmployedRadio" 
            onChange={this.handleRadioInputChange} 
            isChecked={this.state.fields.isBorrowerSelfEmployed} 
             />
        </FormGroup>
        
        <Divider />
        {/** Loan fields */}

        <FormGroup
          label="Loan Type"
          isRequired
          fieldId="loanType">
          <FormSelect
            id="loanType" 
            value={this.state.fields.loanType} 
            onChange={this.handleSelectInputChange}>
            {
            loanTypes.map((option, index) => (
                <FormSelectOption 
                  isDisabled={false} 
                  key={index} 
                  value={option.value} 
                  label={option.label} 
                />
              ))
            }
          </FormSelect>
        </FormGroup>
        <FormGroup
          label="Loan County"
          isRequired
          fieldId="loanCounty">
          <FormSelect
            id="loanCounty" 
            value={this.state.fields.loanCounty} 
            onChange={this.handleSelectInputChange} >
            {
            countyList.map((option, index) => (
                <FormSelectOption 
                  isDisabled={false} 
                  key={index} 
                  value={option.value} 
                  label={option.label} 
                />
              ))
            }
          </FormSelect>
        </FormGroup>
        <FormGroup
          label="Loan Zip Code"
          isRequired
          fieldId="loanZipCode"
          isValid={ isPostalCode(this.state.fields.loanZipCode, 'US') }
          helperText="Enter the Postal Code "
          helperTextInvalid="Must be a valid US Postal Code">
          <TextInput
            isRequired
            type="text"
            id="loanZipCode"
            name="loanZipCode"
            isValid={ isPostalCode(this.state.fields.loanZipCode, 'US') }
            value={this.state.fields.loanZipCode}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        <FormGroup 
          label="Income Document Date" 
          isRequired 
          fieldId="loanIncomeDocumentDate"
          isValid={ dateRegex.test(this.state.fields.loanIncomeDocumentDate) }
          helperText="Enter a valid Date"
          helperTextInvalid="Income Document Date must a valid Date">
          <TextInput
            isRequired={false}
            type="date"
            id="loanIncomeDocumentDate"
            name="loanIncomeDocumentDate"
            placeholder='MM/DD/YYYY'
            isValid={ dateRegex.test(this.state.fields.loanIncomeDocumentDate) }
            value={this.state.fields.loanIncomeDocumentDate}
            onChange={ this.handleTextInputChange } />
        </FormGroup>

          <ActionGroup>
            <Button variant="primary" type="submit" onClick={this.onFormSubmit}>Submit</Button>
            <Button variant="secondary" type="reset">Cancel</Button>
          </ActionGroup>
      </Form>
    );
  }
}

export default AppForm;