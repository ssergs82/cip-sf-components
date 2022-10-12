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

  constructor() {
    super();
    this.template.addEventListener('filterchange', this.onFilterChange.bind(this));
    this.template.addEventListener('paginationinfochange', this.onPaginationInfoChange.bind(this));
  }

  onPaginationInfoChange(event) {
    this.paginationInfo = event.detail.paginationInfo;
    this.loadAccounts();
  };

  //merge a few filters into single with Throttle to prevent a many requests
  applyFiltersWithThrottle(callback, time) {
    if (this.filtersThrottleTimer) return;
    this.filtersThrottleTimer = true;
    setTimeout(() => {
      callback();
      this.filtersThrottleTimer = false;
      //console.log(JSON.parse(JSON.stringify(this.filters)));
    }, time);
  }

  onFilterChange(event) {
    //add new filters into filtersToApply
    Object.assign(this.filtersToApply, event.detail.filters);

    //apply filters with throttle
    this.applyFiltersWithThrottle(() => {
      Object.assign(this.filters, this.filtersToApply);
      this.filtersToApply = {};
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

    let defaultPaginationInfo = {pageNumber: 1, pageSize: 0};
    let currnetPaginationInfo = this.paginationInfo;
    let paginationInfo = Object.assign({}, defaultPaginationInfo, currnetPaginationInfo);

    let sortDirection = this.sortDirection;
    let sortingFieldName = this.sortingFieldName;

    let fieldFilters = "";
    // let defaultAccountFieldFiltersInfo = {
    //     companySize: [],
    //     industry: [],
    //     yearlyRevenue: []
    // };
    // let currnetAccountFieldFiltersInfo = JSON.parse(JSON.stringify(component.get('v.accountFieldFiltersInfo')));
    // let accountFieldFiltersInfo = Object.assign({}, defaultAccountFieldFiltersInfo, currnetAccountFieldFiltersInfo);

    // if(accountFieldFiltersInfo.companySize && accountFieldFiltersInfo.companySize.length) {
    //     accountFieldFiltersInfo.companySize.forEach(function(cz) {
    //         fieldFilters += "&companySizes=" + cz;
    //     })
    // }
    // if(accountFieldFiltersInfo.industry && accountFieldFiltersInfo.industry.length) {
    //     accountFieldFiltersInfo.industry.forEach(function(ind) {
    //         fieldFilters += "&industries=" + ind;
    //     })
    // }
    // if(accountFieldFiltersInfo.yearlyRevenue && accountFieldFiltersInfo.yearlyRevenue.length) {
    //     accountFieldFiltersInfo.yearlyRevenue.forEach(function(yr) {
    //         fieldFilters += "&yearlyRevenues=" + yr;
    //     })
    // }

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
