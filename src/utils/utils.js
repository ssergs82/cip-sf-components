const ENUMS = {
    INDUSTRIES: {
      0: 'Business Services',
      1: 'Computers & Electronics',
      2: 'Consumer Services',
      3: 'Education',
      4: 'Energy, Utilities & Mining',
      5: 'Financial Services',
      6: 'Food & Agriculture',
      7: 'Government',
      8: 'Healthcare, Pharmaceuticals & Biotech',
      9: 'Manufacturing',
      10: 'Media & Entertainment',
      11: 'Non-Profit',
      12: 'Real Estate & Construction',
      13: 'Retail',
      14: 'Software & Internet',
      15: 'Telecommunications',
      16: 'Transportation and Storage',
      17: 'Travel, Recreation and Leisure',
      18: 'Wholesale Distribution',
      19: 'Not specified',
    },
    YEARLY_REVENUES: {
      0: 'Up to 10 Million',
      1: '10 Million to 50 Million',
      2: '50 Million to 100 Million',
      3: '100 Million to 250 Million',
      4: '250 Million to 500 Million',
      5: '500 Million to 1 Billion',
      6: '1 Billion and Above',
      7: 'Not specified',
    },
    COMPANY_SIZES: {
      0: '1-50',
      1: '51-200',
      2: '201-500',
      3: '501-1,000',
      4: '1,001-2,000',
      5: '2,001-5,000',
      6: '5,001-10,000',
      7: 'More than 10,000',
      8: 'Not specified',
    },
    PAGE_SIZES: {
      0: 25,
      1: 50,
      2: 100,
      3: 250,
      4: 500
    }
};

const createUniqueId = function() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

const getRequestParams = function() {
  const { hostname } = new URL(window.location.href);
  let hostnameBase64 = btoa(hostname);
  return {
      method: 'GET',
      headers: {
          'Authorization': 'Bearer SalesForce_'// + hostnameBase64
      }
  }; 
};

const CipBaseUrl = "http://localhost:3001";//"https://staging-api.contentgine.com";

export { ENUMS, getRequestParams, CipBaseUrl, createUniqueId};