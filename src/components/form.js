import "@patternfly/react-core/dist/styles/base.css";
import isEmpty from 'validator/lib/isEmpty';
import isNumeric from 'validator/lib/isNumeric';
import isCurrency from 'validator/lib/isCurrency';
import isPostalCode from 'validator/lib/isPostalCode';

import kieClient from './kieClient';
import './fonts.css';

import React from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  FormSelectOption,
  FormSelect,
  ActionGroup,
  Button,
  Radio,
  Divider,
  Alert, 
  AlertActionCloseButton,
  Tabs, 
  Tab, 
  Modal,
  TextContent,
  Text,
  TextVariants,
  TextList,
  TextListVariants,
  TextListItem,
  TextListItemVariants,
} from '@patternfly/react-core';

const CASES_KIE_CONTAINER_NAME='loan-cases';
const CASE_ID='loan-cases.StandardLoanCase';
const RULES_KIE_CONTAINER_NAME='loan-rules';


class AppForm extends React.Component {
  state = {
    fields: {
      //borrower
      borrowerName: '',
      borrowerDoB: '',
      borrowerIncome: '',
      borrowerCreditScore: '',
      isBorrowerSelfEmployed: 'none',
      //loan
      loanType: 'NONE',
      loanCounty: 'NONE',
      loanZipCode: '',
      loanIncomeDocumentDate: '',
      loanApplicationDate: '',
      loanLockedDate: '',
      loanPayingOffHeloc: 'none',
    },
    fieldErrors: {},
    _saveStatus: 'NONE',
    _canValidate: false,
    _serverResponse: {
      loanFact: {},
      responseFact: {},
    },
    _responseErrorAlertVisible: false,
    _responseModalOpen: false,
    _activeTabKey: 2,          
    _alert: {
      visible: false,
      variant: 'default',
      msg: '',
    },
  };

  onFormSubmit = evt => {
    //const loans = this.state.loans;
    // const form = this.state.fields;

    evt.preventDefault();

    this.setState({
      _saveStatus: 'SAVING',
      _canValidate: true,
    });

    if (this.validate()) return;

    const borrowerFact = kieClient.newInsertCommand({
      "com.redhat.demo.loan_data_objects.Borrower": {
        "selfEmployed": this.state.fields.isBorrowerSelfEmployed === 'yes' ? true : false,
        "creditScore": this.state.fields.borrowerCreditScore,
      }
    }, 'borrower_1', false);

    const loanFact = kieClient.newInsertCommand({
      "com.redhat.demo.loan_data_objects.Loan": {
          "type": this.state.fields.loanType,
          "applicationDate": this.state.fields.loanApplicationDate,
          "county": this.state.fields.loanCounty,
          "zipcode": this.state.fields.loanZipCode,
          "effectiveDate": null,
          "lockedDate": this.state.fields.loanLockedDate,          
          "incomeDocumentDate": this.state.fields.loanIncomeDocumentDate,
          "payingOffHeloc": this.state.fields.loanPayingOffHeloc === 'yes' ? true : false,
      }
    }, 'loan', true);

    const responseFact = kieClient.newInsertCommand({
      "com.redhat.demo.loan_data_objects.Response": {
          "error": null,
          "questions": [],
       }
    }, 'response', true);

    const facts = [borrowerFact, loanFact, responseFact];

    kieClient
      .fireRules(facts, RULES_KIE_CONTAINER_NAME)
      .then((response) => {

        const loanFact = kieClient.extractFactFromKieResponse(response, 'loan');
        const responseFact = kieClient.extractFactFromKieResponse(response, 'response');

        this.setState({
          fields: {
            //borrower
            borrowerName: '',
            borrowerDoB: '',
            borrowerIncome: '',
            borrowerCreditScore: '',
            isBorrowerSelfEmployed: 'none',
            //loan
            loanType: 'NONE',
            loanCounty: 'NONE',
            loanZipCode: '',
            loanIncomeDocumentDate: '',
            loanApplicationDate: '',
            loanLockedDate: '',
            loanPayingOffHeloc: 'no',      
          },
          fieldErrors: {},
          _saveStatus: 'NONE',
          _canValidate: false,
          _serverResponse: {
            loanFact,
            responseFact,
          },
          _responseModalOpen: true,
          // _activeTabKey: 2,
        });

        // scroll the page to make alert visible
        this.scrollToTop();
      })
      .catch(err => {
        console.error(err);
        this.setState({
          _saveStatus: 'ERROR',
          _alert: {
            visible: true,
            variant: 'danger',
            msg: err.status + ': ' +  err.response,
          },
        });
        
        this.scrollToTop();

      });

  };

  // common generic field Input Change Handler
  onInputChange = ({name, value, error}) => {
    const fields = Object.assign({}, this.state.fields);
    const fieldErrors = Object.assign({}, this.state.fieldErrors);
    //console.log('handleTextInputChange Handling: ' + name + ' value = ' + value);

    fields[name] = value;
    fieldErrors[name] = error;

    this.setState({fields, fieldErrors});
  };

  // Form level validation
  validate = () => {
    const form = this.state.fields;
    const fieldErrors = this.state.fieldErrors;
    const errMessages = Object.keys(fieldErrors).filter(k => fieldErrors[k]);

    // if (!form.borrowerName) return true;
    // if (!form.borrowerDoB) return true;
    // if (!form.borrowerIncome) return true;
    if (!form.borrowerCreditScore) return true;
    if (!form.isBorrowerSelfEmployed === 'none') return true;
    if (!form.loanType) return true;
    if (!form.loanCounty) return true;
    if (!form.loanZipCode) return true;
    if (!form.loanIncomeDocumentDate) return true;
    if (!form.loanApplicationDate) return true;
    if (errMessages.length) return true;

    return false;
  };

  // handler for Text fields
  handleTextInputChange = (value, event) => {
    const { id } = event.currentTarget;
    this.onInputChange({ name: id, value, error: false });
  };

  // handler for Radio fields
  handleRadioInputChange = (_, event) => {
    const { name } = event.currentTarget;
    const checkedValue = event.target.value;
    this.onInputChange({ name, value: checkedValue, error: false });
  };  

  // handler for Select fields
  handleSelectInputChange = (value, event) => {
    const { id } = event.currentTarget;
    this.onInputChange({ name: id, value, error: false });
  };

  isValid = (amIValid) => {
    if (this.state._canValidate)
      return amIValid();
    
    return true;
  }

  closeResponseAlert = () => {
    this.setState({
      _alert: {
        visible: false,
        variant: 'default',
        msg: '',
      },
    });
  }
  
  handleModalToggle = () => {
    this.setState(({ _responseModalOpen }) => ({
      _responseModalOpen: !_responseModalOpen
    }));
  };

  // Toggle currently active tab
  handleTabClick = (event, tabIndex) => {
    event.preventDefault();

    switch (tabIndex) {
      case 2: //Rule2_v1 (Loan 1)
        this.setState({
          fields: {
            //borrower
            borrowerCreditScore: '620',
            isBorrowerSelfEmployed: 'yes',
            //loan
            loanType: 'FHA',
            loanCounty: 'Broward',
            loanZipCode: '33008',
            loanIncomeDocumentDate: '2020-03-01',
            loanApplicationDate: '2020-04-02',
            loanLockedDate: null,
            loanPayingOffHeloc: 'no',      
          },
          _canValidate: false,
        });        
        break;
    
      case 3: //Rule2_v2 (Loan 4)
        this.setState({
          fields: {
            //borrower
            borrowerCreditScore: '700',
            isBorrowerSelfEmployed: 'no',
            //loan
            loanType: 'VA',
            loanCounty: 'Broward',
            loanZipCode: '33008',
            loanIncomeDocumentDate: '2020-03-01',
            loanApplicationDate: '2020-04-16',
            loanLockedDate: null,
            loanPayingOffHeloc: 'no',      
          },
          _canValidate: false,
        });
        break;

      case 4: //Rule3_v1 (Loan 1)
        this.setState({
          fields: {
            //borrower
            borrowerCreditScore: '700',
            isBorrowerSelfEmployed: 'yes',
            //loan
            loanType: 'Jumbo',
            loanCounty: 'Broward',
            loanZipCode: '01801',
            loanIncomeDocumentDate: '2020-03-15',
            loanApplicationDate: '2020-03-15',
          },
          _canValidate: false,
        });
        break;

      case 5: //Rule3_v2 (Loan 5)
        this.setState({
          fields: {
            //borrower
            borrowerCreditScore: '700',
            isBorrowerSelfEmployed: 'yes',
            //loan
            loanType: 'Jumbo',
            loanCounty: 'Broward',
            loanZipCode: '01801',
            loanIncomeDocumentDate: '2020-05-05',
            loanApplicationDate: '2020-05-05',
          },
          _canValidate: false,
        });
        break;
            
      case 6: //Rule4_v1 (Loan 1)
      this.setState({
        fields: {
          //borrower
          borrowerCreditScore: '618',
          isBorrowerSelfEmployed: 'no',
          //loan
          loanType: 'FHA',
          loanCounty: 'Broward',
          loanZipCode: '01801',
          loanIncomeDocumentDate: '2020-05-01',
          loanApplicationDate: '1983-05-01',
        },
        _canValidate: false,
      });
      break;

      case 7: //Rule4_v2 (Loan 3)
      this.setState({
        fields: {
          //borrower
          borrowerCreditScore: '680',
          isBorrowerSelfEmployed: 'no',
          //loan
          loanType: 'FHA',
          loanCounty: 'Broward',
          loanZipCode: '01801',
          loanIncomeDocumentDate: '1983-09-29',
          loanApplicationDate: '1983-09-29',
          loanLockedDate: '2020-03-30',
        },
        _canValidate: false,
      });
      break;
          
      case 8: //Rule5_v1 (Loan 2)
      this.setState({
        fields: {
          //borrower
          borrowerCreditScore: '700',
          isBorrowerSelfEmployed: 'no',
          //loan
          loanType: 'FHA',
          loanCounty: 'Broward',
          loanZipCode: '01801',
          loanIncomeDocumentDate: '2020-05-01',
          loanApplicationDate: '2020-05-01',
          loanPayingOffHeloc: 'yes',
        },
        _canValidate: false,
      });
      break;

      case 9: //Rule5_v2 (Loan 3)
      this.setState({
        fields: {
          //borrower
          borrowerCreditScore: '700',
          isBorrowerSelfEmployed: 'no',
          //loan
          loanType: 'Conventional',
          loanCounty: 'Broward',
          loanZipCode: '01801',
          loanIncomeDocumentDate: '2020-05-01',
          loanApplicationDate: '2020-05-01',
          loanPayingOffHeloc: 'yes',
        },
        _canValidate: false,
      });
      break;
                    
      default:
        break;
    }

    this.setState({
      _activeTabKey: tabIndex
    });
  }

  scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  render() {
    const loanTypes = [
      { value: 'NONE', label: 'Select Loan Type', disabled: false },
      { value: 'FHA', label: 'FHA', disabled: false },
      { value: 'VA', label: 'VA', disabled: false },
      { value: 'Conventional', label: 'Conventional', disabled: false },
      { value: 'Jumbo', label: 'Jumbo', disabled: false },
    ];
    const countyList = [
      { value: 'NONE', label: 'Select County', disabled: false },
      { value: 'Broward', label: 'Broward', disabled: false },
      { value: 'Wayne', label: 'Wayne', disabled: false },
      { value: 'Alachua', label: 'Alachua', disabled: false },
      { value: 'Baker', label: 'Baker', disabled: false },
      { value: 'Bradford', label: 'Bradford', disabled: false },
    ];
    const dateRegex = /(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/;

    return (
      <Form isHorizontal>
        <React.Fragment>
          {/**/
          this.state._alert.visible && (
            <Alert
              variant={this.state._alert.variant}
              autoFocus={true}
              title={this.state._alert.msg}
              action={<AlertActionCloseButton onClose={this.closeResponseAlert} />}
            />
          )
          /**/}

          <Modal
            isSmall
            title="Loan Application submitted!"
            isOpen={this.state._responseModalOpen}
            onClose={this.handleModalToggle}
            actions={[
              <Button key="confirm" variant="primary" onClick={this.handleModalToggle}>
                Confirm
              </Button>,
              <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
                Cancel
              </Button>
            ]}
            isFooterLeftAligned
          >
            <TextContent>
              <TextList component={TextListVariants.dl}>
                <TextListItem component={TextListItemVariants.dt}>Loan Type</TextListItem>
                <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.loanFact.type}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>Effective Date</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.loanFact.effectiveDate}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>Application Date</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.loanFact.applicationDate}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>Conditions</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.loanFact.conditions}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>County</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.loanFact.county}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>Zip Code</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.loanFact.zipcode}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>Income Document Date</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.loanFact.incomeDocumentDate}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>Locked Date</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.loanFact.lockedDate}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>Paying Off Heloc</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.loanFact.payingOffHeloc ? 'yes' : 'no'}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>Questions</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.responseFact.questions}</TextListItem>
                <TextListItem component={TextListItemVariants.dt}>Errors</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.responseFact.error}</TextListItem>
              </TextList>
            </TextContent>

        </Modal>        
        </React.Fragment>
        {/** Borrower fields */}
        <Tabs isFilled activeKey={this.state._activeTabKey} onSelect={this.handleTabClick}>
          <Tab eventKey={2} title="Rule2_v1">
            Expiration Date <strong>(Rule2_v1 - loan 1)</strong>
            <br/>
            <Text component={TextVariants.small}>
            <em>"FHA loan 4/2, income date entered as 3/1/2020 - Exp date calculated as 6/28/2020"</em>
            </Text>
          </Tab>
          <Tab eventKey={3} title="Rule2_v2">
            Expiration Date <strong>(Rule2_v2 - loan 4)</strong>
            <br/>
            <Text component={TextVariants.small}>
            <em>Scenario: "VA loan 4/16, income date entered as 3/1/2020 - Exp date calculated as 6/28/2020"</em>
            </Text>
          </Tab>
          <Tab eventKey={4} title="Rule3_v1">
            UW Jumbo Loans <strong>(Rule3_v1 - loan 1)</strong>
            <br/>
            <Text component={TextVariants.small}>
            <em>Scenario: "Jumbo loan with application date of 3/15 - self employed borrower.  - No condition added"</em>
            </Text>
          </Tab>
          <Tab eventKey={5} title="Rule3_v2">
            Jumbo Loans <strong>(Rule3_v2 - loan 5)</strong>
            <br/>
            <Text component={TextVariants.small}>
            <em>Scenario: "Jumbo loan with application date of 5/5/2020 - self employed flag checked - Conditions 1 and 2 added."</em>
            </Text>
          </Tab>
          <Tab eventKey={6} title="Rule4_v1">
            FHA FICO <strong>(Rule4_v1 - loan 1)</strong>
            <br/>
            <Text component={TextVariants.small}>
            <em>Scenario: "FHA loan with 618 fico - Error received."</em>
            </Text>
          </Tab>
          <Tab eventKey={7} title="Rule4_v2">
            FHA FICO <strong>(Rule4_v2 - loan 3)</strong>
            <br/>
            <Text component={TextVariants.small}>
            <em>Scenario: "FHA loan with credit score of 650 - locked on 3/30/2020 - No error received"</em>
            </Text>
          </Tab>
          <Tab eventKey={8} title="Rule5_v1">
            Post Closing <strong>(Rule5_v1 - loan 2)</strong>
            <br/>
            <Text component={TextVariants.small}>
            <em>Scenario: "FHA loan paying off a HELOC - do not populate checklist question"</em>
            </Text>
          </Tab>
          <Tab eventKey={9} title="Rule5_v1">
            Post Closing <strong>(Rule5_v1 - loan 3)</strong>
            <br/>
            <Text component={TextVariants.small}>
            <em>Scenario: "conventional loan paying off a HELOC - populate checklist question"</em>
            </Text>
          </Tab>
        </Tabs>
        {/**        
        <FormGroup
          label="Borrower Name"
          isRequired
          fieldId="borrowerName"
          isValid={ this.isValid( () => (!isEmpty(this.state.fields.borrowerName)) ) }
          helperText="Enter your Name"
          helperTextInvalid="Name must not be empty">
          <TextInput
            isRequired
            type="text"
            id="borrowerName"
            name="borrowerName"
            isValid={ this.isValid( () => (!isEmpty(this.state.fields.borrowerName)) ) }
            value={this.state.fields.borrowerName}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        <FormGroup 
          label="Date of Birth" 
          isRequired={false} 
          fieldId="borrowerDoB"
          isValid={ this.isValid( () => (dateRegex.test(this.state.fields.borrowerDoB)) ) }
          helperText="Enter your Date of Birth"
          helperTextInvalid="DoB must a valid Date">
          <TextInput
            isRequired={false}
            type="date"
            id="borrowerDoB"
            name="borrowerDoB"
            placeholder='MM/DD/YYYY'
            isValid={ this.isValid( () => (dateRegex.test(this.state.fields.borrowerDoB)) ) }
            value={this.state.fields.borrowerDoB}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        <FormGroup 
          label="Income" 
          isRequired={false} 
          fieldId="borrowerIncome"
          isValid={ this.isValid( () => (isCurrency(this.state.fields.borrowerIncome)) ) }
          helperText="Enter your yearly income "
          helperTextInvalid="Income must be a valid currency value">
          <TextInput
            isRequired
            type="number"
            id="borrowerIncome"
            placeholder="$0.00"
            name="borrowerIncome"
            isValid={ this.isValid( () => (isCurrency(this.state.fields.borrowerIncome)) ) }
            value={this.state.fields.borrowerIncome}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        **/
        }
        <FormGroup 
          label="Credit Score" 
          isRequired 
          fieldId="borrowerCreditScore"
          isValid={ this.isValid( () => (isNumeric(this.state.fields.borrowerCreditScore)) ) }
          helperText="Enter your Credit Score "
          helperTextInvalid="Score must be a valid number '1-1000'">
          <TextInput
            isRequired
            type="number"
            id="borrowerCreditScore"
            placeholder="0-1000"
            name="borrowerCreditScore"
            isValid={ this.isValid( () => (isNumeric(this.state.fields.borrowerCreditScore)) ) }
            value={this.state.fields.borrowerCreditScore}
            onChange={ this.handleTextInputChange }
          />
        </FormGroup>
        <FormGroup 
          isInline label="Self Employed?" 
          isRequired
          fieldId="isBorrowerSelfEmployed"
          helperTextInvalid="Select 'Yes' or 'No'"
          isValid={ this.isValid( () => (/(yes|no)/.test(this.state.fields.isBorrowerSelfEmployed)) ) }>
          <Radio 
            name="isBorrowerSelfEmployed" 
            id="isBorrowerSelfEmployed"
            label="Yes" 
            value="yes"
            onChange={this.handleRadioInputChange} 
            isChecked={this.state.fields.isBorrowerSelfEmployed === 'yes'}
          />
          <Radio 
            name="isBorrowerSelfEmployed" 
            id="isBorrowerSelfEmployed" 
            label="No" 
            value="no"
            onChange={this.handleRadioInputChange} 
            isChecked={this.state.fields.isBorrowerSelfEmployed === 'no'}
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
            onChange={this.handleSelectInputChange}
            isValid={this.isValid( () => (this.state.fields.loanType !== 'NONE') )}>
            {
            loanTypes.map((option, index) => (
                <FormSelectOption 
                  isDisabled={option.disabled} 
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
            onChange={this.handleSelectInputChange}
            isValid={this.isValid( () => (this.state.fields.loanCounty !== 'NONE') )}>
            {
            countyList.map((option, index) => (
                <FormSelectOption 
                  isDisabled={option.disabled} 
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
          isValid={ this.isValid( () => (isPostalCode(this.state.fields.loanZipCode, 'US')) ) }
          helperText="Enter the Postal Code "
          helperTextInvalid="Must be a valid US Postal Code">
          <TextInput
            isRequired
            type="text"
            id="loanZipCode"
            name="loanZipCode"
            isValid={ this.isValid( () => (isPostalCode(this.state.fields.loanZipCode, 'US')) ) }
            value={this.state.fields.loanZipCode}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        <FormGroup 
          isInline label="Paying Off Heloc?" 
          isRequired={false}
          fieldId="loanPayingOffHeloc"
          helperTextInvalid="Select 'Yes' or 'No'"
        >
          <Radio 
            name="loanPayingOffHeloc" 
            id="loanPayingOffHeloc"
            label="Yes" 
            value="yes"
            onChange={this.handleRadioInputChange} 
            isChecked={this.state.fields.loanPayingOffHeloc === 'yes'}
          />
          <Radio 
            name="loanPayingOffHeloc" 
            id="loanPayingOffHeloc" 
            label="No" 
            value="no"
            onChange={this.handleRadioInputChange} 
            isChecked={this.state.fields.loanPayingOffHeloc === 'no'}
          />
        </FormGroup>
        <FormGroup 
          label="Income Document Date" 
          isRequired 
          fieldId="loanIncomeDocumentDate"
          isValid={ this.isValid( () => (dateRegex.test(this.state.fields.loanIncomeDocumentDate)) ) }
          helperText="Enter a valid Date"
          helperTextInvalid="Income Document Date must be valid">
          <TextInput
            isRequired={false}
            type="date"
            id="loanIncomeDocumentDate"
            name="loanIncomeDocumentDate"
            placeholder='MM/DD/YYYY'
            isValid={ this.isValid( () => (dateRegex.test(this.state.fields.loanIncomeDocumentDate)) ) }
            value={this.state.fields.loanIncomeDocumentDate}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        <FormGroup 
          label="Application Date" 
          isRequired 
          fieldId="loanApplicationDate"
          isValid={ this.isValid( () => (dateRegex.test(this.state.fields.loanApplicationDate)) ) }
          helperText="Enter a valid Date"
          helperTextInvalid="Application Date must be valid">
          <TextInput
            isRequired={false}
            type="date"
            id="loanApplicationDate"
            name="loanApplicationDate"
            placeholder='MM/DD/YYYY'
            isValid={ this.isValid( () => (dateRegex.test(this.state.fields.loanApplicationDate)) ) }
            value={this.state.fields.loanApplicationDate}
            onChange={ this.handleTextInputChange } />
        </FormGroup>
        <FormGroup 
          label="Locked Date" 
          isRequired={false} 
          fieldId="loanLockedDate"
          helperText="Enter a valid Date"
          helperTextInvalid="Locked Date must be valid">
          <TextInput
            isRequired={false}
            type="date"
            id="loaLockednDate"
            name="loanLockedDate"
            placeholder='MM/DD/YYYY'
            value={this.state.fields.loanLockedDate}
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