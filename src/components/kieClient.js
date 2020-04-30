import fetch from 'isomorphic-fetch';

const KIE_SERVER_API_BASE_URL='http://localhost:8080/kie-server/services/rest/server';
const KIE_SERVER_CLIENT_USER='pamAdmin';
const KIE_SERVER_CLIENT_PWD='redhatpam1!';
const KIE_SERVER_API_RULES_CONTEXT_PATH='/containers/instances/${kie_container_name}';
const KIE_SERVER_API_CASES_CONTEXT_PATH='/containers/${kie_container_name}/cases/${case_definition_id}/instances';

//HTTP Headers:
// Accept: application/json
// Content-Type: application/json
// Authorization:'Basic cGFtQWRtaW46cmVkaGF0cGFtMSE='

//Fire a Drools Rule
//POST http://localhost:8080/kie-server/services/rest/server/containers/instances/loan-rules_1.0.0-SNAPSHOT

// create a new case instance
//POST http://localhost:8080/kie-server/services/rest/server/containers/loan-cases/cases/loan-cases.StandardLoanCase/instances
//Body: {"case-data": { "var name": {} } }

// add a loan to case
//POST http://localhost:8080/kie-server/services/rest/server/containers/loan-cases_1.0.0-SNAPSHOT/cases/instances/CASE-0000000001/caseFile
//Body: { caseData variable: {...} }

//fire rules in a case instance
//PUT http://localhost:8080/kie-server/services/rest/server/containers/loan-cases_1.0.0-SNAPSHOT/cases/instances/CASE-0000000002/tasks/Rules
//Body: {}


/**
 * Client for the Remote KIE Sever API
 */
class KieClient {
  constructor() {
    
  }

  // kie API call functions

  createLoanCase(caseData, kieContainerName, caseId) {
    console.log('calling kie server to create a case...')
    const url = (
        KIE_SERVER_API_BASE_URL + '/containers/' + kieContainerName + '/cases/' + caseId + '/instances'
    );

    // const caseData = {
    //   "case-data": {
    //       "loan": {
    //           "com.redhat.demo.loan_data_objects.Loan": {
    //               "type": this.state.fields.loanCounty,
    //               "effectiveDate": null,
    //               "applicationDate": this.state.fields.loanApplicationDate,
    //               "county": this.state.fields.loanCounty,
    //               "zipcode": this.state.fields.loanZipCode,
    //               "lockedDate": null,
    //               "incomeDocumentDate": this.state.fields.loandIncomeDocumentDate,
    //           }
    //       },
    //   }
    // };

    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization':'Basic cGFtQWRtaW46cmVkaGF0cGFtMSE=',
      },
      body: JSON.stringify(caseData),
    }).then(this.checkStatus)
        .then(this.parseJson);
  }

  newInsertCommand(fact, factId, shouldReturn) {
    const obj = {
        "insert": {
            "object": fact,
            "out-identifier": factId,
            "return-object": shouldReturn,
        },
    };
    //console.debug(JSON.stringify(obj, null, '\t'));
    return obj;
  }

  fireRules(facts, kieContainerName){
    console.log('\n\n--------------------------------');
    console.log('calling kie server to fire rules...');

    //POST http://localhost:8080/kie-server/services/rest/server/containers/instances/loan-rules_1.0.0-SNAPSHOT
    const url = (
        KIE_SERVER_API_BASE_URL + '/containers/instances/' + kieContainerName
    );

    const requestBody = {
        "lookup": "debug-stateless-kie-session",
        "commands": [
            ...facts,
            {
                "fire-all-rules": {}
            }
        ]
    }// fact obj end

    console.debug('body payload:\n', JSON.stringify(requestBody, null, '\t'));
    console.log('--------------------------------\n\n')

    return fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization':'Basic cGFtQWRtaW46cmVkaGF0cGFtMSE=',
        },
        body: JSON.stringify(requestBody),
      }).then(this.checkStatus)
            .then(this.parseJson);  
  }

//   getOpenUnderwritingLoanCases() {

//   }

//   validateOpenLoansPipeline() {

//   }

//   naturalDisasterRule1() {

//   }

//   expiratonDateRule2() {

//   }

//   uwConditionRule3() {

//   }

//   fhaFicoRule4(){

//   }
//   postCloseConditionRule3() {

//   }

  // helper functions

  checkStatus(response) {
    console.debug('Response from api server: ', response);

    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      const error = new Error(`HTTP Error ${response.statusText}`);
      error.status = response.statusText;
      error.response = response;
      console.debug(error);
      console.log(error);
      throw error;
    }
  }

  parseJson(response) {
    return response.json();
  }
}

const kieClient = new KieClient();
export default kieClient;