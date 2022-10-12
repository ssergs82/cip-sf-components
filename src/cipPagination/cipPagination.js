import { LightningElement, api, track } from "lwc";
import { ENUMS } from "c/utils";

const MaxCountSeries = 4;

/**
 * Cip Pagination component
 */
export default class CipPagination extends LightningElement {

  @track _total = 0;

  @api
  get total() {
    return this._total;
  }
  set total(value) {
    this.setAttribute('total', value);
    this._total = value;

    this.onTotalChange();
  }

  pageSize = 0;
  currentPageRowsStats = '';
  pageNumber = 1;
  maxPageNumber = 1;
  paginationInfo = {};

  startButtons = [];
  middleButtons = [];
  endButtons = [];

  pageSizeOptions = [
    { label: "25", value: 0 },
    { label: "50", value: 1 },
    { label: "100", value: 2 },
    { label: "250", value: 3 },
    { label: "500", value: 4 },
  ];

  constructor() {
    super();
  }

  onPageSizeChange(event) {
    this.pageSize = parseInt(event.detail.value, 10);
    this.onTotalChange();
  }

  onPrevPageClick() {
    let pageNumber = this.pageNumber;
    if (pageNumber > 1) {
      pageNumber--;
    }
    this.pageNumber = pageNumber;

    this.onTotalChange();
  }

  onNextPageClick() {
    let pageNumber = this.pageNumber;
    let maxPageNumber = this.maxPageNumber;

    if (pageNumber < maxPageNumber) {
      pageNumber++;
    }
    this.pageNumber = pageNumber;

    this.onTotalChange();
  }

  onPageClick(event) {
    let pageNumber = parseInt(event.target.dataset.id, 10);
    this.pageNumber = pageNumber;

    this.onTotalChange();
  }

  get hasMiddleButtons() {
    return this.middleButtons.length > 0;
  }

  get maxPageNumberMoreThan4() {
    return this.maxPageNumber > MaxCountSeries;
  }

  get nextButtonDisabled() {
    return this.pageNumber >= this.maxPageNumber;
  }

  get prevButtonDisabled() {
    return this.pageNumber == 1;
  }

  onPageToGoKeyPress(event) {
    if (event.which != 13) { //enter pressed
      return;
    }

    let pageToGo = parseInt(event.target.value, 10);
    if (pageToGo < 1 || pageToGo > this.maxPageNumber) {
      return;
    }
    this.pageNumber = pageToGo;

    this.onTotalChange();
  }

  onTotalChange() {
    let total = this.total;
    let pageNumber = this.pageNumber;
    let rowsPerPage = ENUMS.PAGE_SIZES[this.pageSize];

    this.currentPageRowsStats = ((pageNumber - 1) * rowsPerPage + 1) + '-' + (pageNumber * rowsPerPage) + ' of ' + total;
    let maxPageNumber = Math.floor(total / rowsPerPage + (total % rowsPerPage == 0 ? (total == 0 ? 1 : 0) : 1));
    this.maxPageNumber = maxPageNumber;

    let startButtons = [];
    let middleButtons = [];
    let endButtons = [];

    if (pageNumber < MaxCountSeries) {
      let maxPos = Math.min(pageNumber + 1, MaxCountSeries, maxPageNumber);
      for (let i = 1; i <= maxPos; i++) {
        startButtons.push({ value: i, isDisabled: pageNumber == i });
      }
      endButtons.push({ value: maxPageNumber, isDisabled: pageNumber == maxPageNumber });
    }
    else if (pageNumber > maxPageNumber - MaxCountSeries + 1) {
      let minPos = Math.max(pageNumber - 1, maxPageNumber - MaxCountSeries, 1);
      for (let i = minPos; i <= maxPageNumber; i++) {
        endButtons.push({ value: i, isDisabled: pageNumber == i });
      }
      startButtons.push({ value: 1, isDisabled: pageNumber == 1 });
    }
    else {
      let minPos = pageNumber - 1;
      let maxPos = pageNumber + 1;
      for (let i = minPos; i <= maxPos; i++) {
        middleButtons.push({ value: i, isDisabled: pageNumber == i });
      }
      startButtons.push({ value: 1, isDisabled: pageNumber == 1 });
      endButtons.push({ value: maxPageNumber, isDisabled: pageNumber == maxPageNumber });
    }
    this.startButtons = startButtons;
    this.middleButtons = middleButtons;
    this.endButtons = endButtons;
    this.maxPageNumber = maxPageNumber;

    this.paginationInfo = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    const paginationInfoChangeEvent = new CustomEvent('paginationinfochange', {
      detail: { paginationInfo: this.paginationInfo },
      bubbles: true
    });

    // Fire the custom event
    this.dispatchEvent(paginationInfoChangeEvent);
  }
}
