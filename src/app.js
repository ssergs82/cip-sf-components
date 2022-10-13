import { LightningElement, api, track } from "lwc";
import { CipBaseUrl, getRequestParams, ENUMS } from "c/utils";

export default class App extends LightningElement {

  @api accounts = [];
  @track total = 0;

  filters = {};
  filtersToApply = {};
  filtersThrottleTimer = false;
  sortingFieldName = "IntentScore";
  sortDirection = 1;
  currentRequestUrl = "";
  paginationInfo = {};

  companySizeOptions = [
    { 'Id': 0, 'Name': '1-50' },
    { 'Id': 1, 'Name': '51-200' },
    { 'Id': 2, 'Name': '201-500' },
    { 'Id': 3, 'Name': '501-1,000' },
    { 'Id': 4, 'Name': '1,001-2,000' },
    { 'Id': 5, 'Name': '2,001-5,000' },
    { 'Id': 6, 'Name': '5,001-10,000' },
    { 'Id': 7, 'Name': 'More than 10,000' },
    { 'Id': 8, 'Name': 'Not specified' }
  ];

  yearlyRevenueOptions = [
    { 'Id': 0, 'Name': 'Up to 10 Million' },
    { 'Id': 1, 'Name': '10 Million to 50 Million' },
    { 'Id': 2, 'Name': '50 Million to 100 Million' },
    { 'Id': 3, 'Name': '100 Million to 250 Million' },
    { 'Id': 4, 'Name': '250 Million to 500 Million' },
    { 'Id': 5, 'Name': '500 Million to 1 Billion' },
    { 'Id': 6, 'Name': '1 Billion and Above' },
    { 'Id': 7, 'Name': 'Not specified' }
  ];

  industryOptions = [
    {'Id':0,'Name':'Business Services'},
    {'Id':1,'Name':'Computers & Electronics'},
    {'Id':2,'Name':'Consumer Services'},
    {'Id':3,'Name':'Education'},
    {'Id':4,'Name':'Energy, Utilities & Mining'},
    {'Id':5,'Name':'Financial Services'},
    {'Id':6,'Name':'Food & Agriculture'},
    {'Id':7,'Name':'Government'},
    {'Id':8,'Name':'Healthcare, Pharmaceuticals & Biotech'},
    {'Id':9,'Name':'Manufacturing'},
    {'Id':10,'Name':'Media & Entertainment'},
    {'Id':11,'Name':'Non-Profit'},
    {'Id':12,'Name':'Real Estate & Construction'},
    {'Id':13,'Name':'Retail'},
    {'Id':14,'Name':'Software & Internet'},
    {'Id':15,'Name':'Telecommunications'},
    {'Id':16,'Name':'Transportation and Storage'},
    {'Id':17,'Name':'Travel, Recreation and Leisure'},
    {'Id':18,'Name':'Wholesale Distribution'},
    {'Id':19,'Name':'Not specified'}
  ];

  constructor() {
    super();
    this.template.addEventListener('filterchange', this.onFilterChange.bind(this));
    this.template.addEventListener('paginationinfochange', this.onPaginationInfoChange.bind(this));
    this.template.addEventListener('closeallmultidropdown', this.onCloseAllMultiDropDownEvent.bind(this));
  }

  onCloseAllMultiDropDownEvent(event) {
    const dropdowns = this.template.querySelectorAll("c-cip-multi-select-dropdown");
    dropdowns.forEach(function (dd) {
      dd.close(/*ignore fromUniqueId component*/event.detail.fromUniqueId);
    });
  }

  onPaginationInfoChange(event) {
    this.paginationInfo = event.detail.paginationInfo;
    this.loadAccounts();
  };

  //merge a few filters into single with Throttle to prevent a many requests
  applyFiltersWithThrottle(callback, time) {
    if (this.filtersThrottleTimer){
       clearTimeout(this.filtersThrottleTimer);
    }
    
    this.filtersThrottleTimer = setTimeout(() => {
      callback();
      this.filtersThrottleTimer = 0;
    }, time);
  }

  onFilterChange(event) {
    //add new filters into filtersToApply
    Object.assign(this.filtersToApply, event.detail.filters);

    //apply filters with throttle
    this.applyFiltersWithThrottle(() => {
      Object.assign(this.filters, this.filtersToApply);
      this.filtersToApply = {};
      //console.log("filters", this.filters);
      this.loadAccounts();
    }, 600);
  };

  onSortFieldChange(event) {
    let newSortingFieldName = event.target.dataset.id;

    if (newSortingFieldName == this.sortingFieldName) {
      this.sortDirection = this.sortDirection == 0 ? 1 : 0;
    }
    else {
      this.sortingFieldName = newSortingFieldName;
      this.sortDirection = 1;
    }

    this.loadAccounts();
  }

  loadAccounts() {

    let categoryId = this.filters.categoryId;
    let timeFrame = this.filters.timeFrame;

    let defaultPaginationInfo = { pageNumber: 1, pageSize: 0 };
    let currnetPaginationInfo = this.paginationInfo;
    let paginationInfo = Object.assign({}, defaultPaginationInfo, currnetPaginationInfo);

    let sortDirection = this.sortDirection;
    let sortingFieldName = this.sortingFieldName;

    let fieldFilters = "";
    if (this.filters.companySize && this.filters.companySize.length) {
      this.filters.companySize.forEach(function (cz) {
        fieldFilters += "&companySizes=" + cz;
      })
    }
    if (this.filters.industry && this.filters.industry.length) {
      this.filters.industry.forEach(function (ind) {
        fieldFilters += "&industries=" + ind;
      })
    }
    if (this.filters.yearlyRevenue && this.filters.yearlyRevenue.length) {
      this.filters.yearlyRevenue.forEach(function (yr) {
        fieldFilters += "&yearlyRevenues=" + yr;
      })
    }

    let filteredAccountsUrl = CipBaseUrl + "/accounts?categoryId=" + categoryId
      + "&timeFrame=" + timeFrame
      + "&accountListId="
      + "&pageNumber=" + paginationInfo.pageNumber
      + "&pageSize=" + paginationInfo.pageSize
      + "&sortDirection=" + sortDirection
      + "&sortingFieldName=" + sortingFieldName
      + "&name=" + fieldFilters;


    //prevent the same request again
    if (this.currentRequestUrl == filteredAccountsUrl) {
      return;
    }

    this.currentRequestUrl = filteredAccountsUrl;
    let requestParams = getRequestParams();

    let that = this;
    fetch(filteredAccountsUrl, requestParams)
      .then(response => {
        //console.log(response);
        if (response.ok) {
          return response.json();
        } else {
          throw Error(response);
        }
      })
      .then(accountsInfo => {
        //console.log(accountsInfo);

        let mappedAccounts = [];
        accountsInfo.items.forEach(function (account) {

          let mappedAccount = {
            accountId: account.accountId,
            companySize: ENUMS.COMPANY_SIZES[account.companySize],
            industry: ENUMS.INDUSTRIES[account.industry],
            yearlyRevenue: ENUMS.YEARLY_REVENUES[account.yearlyRevenue],
            intentScore: account.intentScore,
            isSurging: account.isSurging,
            name: account.name,
            domainName: account.domainName,
            scoreChange: account.scoreChange,
            salesForceRecordUrl: '',
            hasSalesForceRecordUrl: false
          };

          mappedAccounts.push(mappedAccount);
        });

        // let domainNames = accountsInfo.items.map(({domainName}) => domainName);
        // helper.populateAccountsUrlAsync(component, domainNames, mappedAccounts);

        that.accounts = mappedAccounts;
        that.total = accountsInfo.total;
      })
      .catch(error => console.log(error));
  }
}
