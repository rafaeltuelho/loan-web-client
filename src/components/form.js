import "@patternfly/react-core/dist/styles/base.css";
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
    borrowerName: '',
    borrowerDoB: '01-01-1970',
    borrowerIncome: 0.0,
    borrowerCreditScore: 0,
    isBorrowerSelfEmployed: false,

    loanType: '',
    loanCounty: '',
    loanZipCode: '',
    loandIncomeDocumentDate: '01-01-2020',
  };

  handleTextInputChange = (value) => {
    console.log(value);
    //this.setState({ value });
  };

  handleRadioInputChange = (_, event) => {
    console.log(event);
    const { value } = event.currentTarget;
    // this.setState({ [value]: true });
  };  

  handleSelectInputChange = (value, event) => {
    console.debug(event);
    console.log(value);
    //this.setState({ value });
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

    return (
      <Form isHorizontal>
        {/** Borrower fields */}
        <FormGroup
          label="Applicant Name"
          isRequired
          fieldId="borrower-name">
          <TextInput
            isRequired
            type="text"
            id="borrower-name"
            name="borrower-name"
            value={this.state.borrowerName}
            onChange={this.handleTextInputChange} />
        </FormGroup>
        <FormGroup 
          label="Date of Birth" 
          isRequired={false} 
          fieldId="borrower-dob">
          <TextInput
            isRequired={false}
            type="date"
            id="borrower-dob"
            name="borrower-dob"
            placeholder='MM-DD-YYYY'
            value={this.state.borrowerDoB}
            onChange={this.handleTextInputChange} />
        </FormGroup>
        <FormGroup 
          label="Income" 
          isRequired={false} 
          fieldId="borrower-income">
          <TextInput
            isRequired
            type="number"
            id="borrower-income"
            placeholder="$0.00"
            name="borrower-income"
            value={this.state.borrowerIncome}
            onChange={this.handleTextInputChange} />
        </FormGroup>
        <FormGroup 
          label="Creadit Score" 
          isRequired 
          fieldId="borrower-creditscore">
          <TextInput
            isRequired
            type="number"
            id="borrower-creditscore"
            placeholder="0-1000"
            name="borrower-creditscore"
            value={this.state.borrowerCreditScore}
            onChange={this.handleTextInputChange}
          />
        </FormGroup>
        <FormGroup 
          isInline label="Self Employed?" 
          isRequired
          fieldId="isBorrowerSelfEmployed">
          <Radio name="borrowerSelfEmployedRadio" label="Yes" id="borrowerSelfEmployedRadio"
            onChange={this.handleRadioInputChange} 
            isChecked={this.state.isBorrowerSelfEmployed} 
            value={this.state.isBorrowerSelfEmployed} />
          <Radio name="borrowerNotSelfEmployedRadio" label="No" id="borrowerNotSelfEmployedRadio" 
            onChange={this.handleRadioInputChange} 
            isChecked={!this.state.isBorrowerSelfEmployed} 
            value={this.state.isBorrowerSelfEmployed} />
        </FormGroup>
        
        <Divider />
        {/** Loan fields */}

        <FormGroup
          label="Loan Type"
          isRequired
          fieldId="loan-type">
          <FormSelect
            id="loanType" 
            value={this.state.loanType} 
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
          fieldId="loan-county">
          <FormSelect
            id="loanCounty" 
            value={this.state.loanCounty} 
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
          fieldId="loan-zip-code">
          <TextInput
            isRequired
            type="text"
            id="loan-zip-code"
            name="loan-zip-code"
            value={this.state.loanZipCode}
            onChange={this.handleTextInputChange} />
        </FormGroup>
        <FormGroup 
          label="Income Document Date" 
          isRequired 
          fieldId="loan-income-document-date">
          <TextInput
            isRequired={false}
            type="date"
            id="loan-income-document-date"
            name="loan-income-document-date"
            placeholder='MM-DD-YYYY'
            value={this.state.loanIncomeDocumentDate}
            onChange={this.handleTextInputChange} />
        </FormGroup>

        <ActionGroup>
          <Button variant="primary">Submit</Button>
          <Button variant="secondary">Cancel</Button>
        </ActionGroup>
      </Form>
    );
  }
}

export default AppForm;