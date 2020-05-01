import fetch from 'isomorphic-fetch';

const KIE_SERVER_API_BASE_URL='http://localhost:8080/kie-server/services/rest/server';
const KIE_SERVER_CLIENT_USER='pamAdmin';
const KIE_SERVER_CLIENT_PWD='redhatpam1!';
const KIE_SERVER_AUTH_BASE64=btoa(KIE_SERVER_CLIENT_USER + ':' + KIE_SERVER_CLIENT_PWD);
// const KIE_SERVER_API_RULES_CONTEXT_PATH='/containers/instances/${kie_container_name}';
// const KIE_SERVER_API_CASES_CONTEXT_PATH='/containers/${kie_container_name}/cases/${case_definition_id}/instances';

/**
 * Client for the Remote KIE Sever API
 */
class KieClient {
  constructor() {
  }

  // kie API call functions

  createLoanCase(caseData, kieContainerName, caseId) {
    console.log('calling kie server to create a case...');
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
        'Authorization':'Basic ' + KIE_SERVER_AUTH_BASE64,
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
        // force an error on kie-server
        // "out-identifier": factId,
        // "return-object": shouldReturn,
    };
    //console.debug(JSON.stringify(obj, null, '\t'));
    return obj;
  }
  
  extractFactFromKieResponse(serverResponse, factId) {
    let factWrapper = null;
    if (serverResponse.result)
        factWrapper = serverResponse.result['execution-results'].results.find( o => o.key === factId );

    if(factWrapper){
        // as the wrapper object has only one property which is the FQDN for the Fact Class Type
        // we'are interest in the enclosing object which represents the Fact Type structure
        return Object.entries(factWrapper.value)[0][1];
    } else {
        const error = new Error(`Fact Object with identifier ${factId} not found on response`);
        error.status = 'FACT NOT FOUND';
        error.response = `Fact Object with identifier ${factId} not found on response`;
        console.debug(error);
        console.log(error);
        throw error;        
    }
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
          'Authorization':'Basic ' + KIE_SERVER_AUTH_BASE64,
        },
        body: JSON.stringify(requestBody),
      }).then(this.checkHttpStatus)
            .then(this.parseJson)
            .then(this.checkKieResponse) 
  }

  // helper functions

  checkHttpStatus(response) {
    console.debug('Response from api server: \n', JSON.stringify(response, null, '\t'));
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

  checkKieResponse(response) {
    console.debug('Response from KIE api server: \n', JSON.stringify(response, null, '\t'));
    if (response.type !== 'FAILURE' && response.result) {
        return response;
    } else {
      const error = new Error(`KIE API Error ${response.msg}`);
      error.status = response.type;
      error.response = response.msg;
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