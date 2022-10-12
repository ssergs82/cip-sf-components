import { LightningElement } from "lwc";

/**
 * Cip TimeFrame Dropdown component
 */
export default class CipTimeFrameDropdown extends LightningElement {

  options = [
    { label: "Last 30 days", value: 0 },
    { label: "Last 60 days", value: 1 },
    { label: "Last 90 days", value: 2 },
    { label: "Last 6 months", value: 3 },
    { label: "Last 12 months", value: 4 },
  ];
  selectedTimeFrame = 0;

  constructor() {
    super();

    //send initial event
    setTimeout(function () {
      this.onChange({ detail: { value: this.selectedTimeFrame } });
    }.bind(this), 0);
  }

  onChange(event) {
    this.selectedTimeFrame = parseInt(event.detail.value);

    let filters = {
      timeFrame: this.selectedTimeFrame
    };

    const filterChangeEvent = new CustomEvent('filterchange', {
      detail: { filters },
      bubbles: true
    });

    // Fire the custom event
    this.dispatchEvent(filterChangeEvent);
  }
}
