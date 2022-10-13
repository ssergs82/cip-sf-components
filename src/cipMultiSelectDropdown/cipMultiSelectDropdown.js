import { LightningElement, track, api } from "lwc";
import { createUniqueId } from "c/utils";

/**
 * Cip Multi Select Dropdown component
 * Aura example:
 *  https://github.com/choudharymanish8585/Multi-Select-Picklist-Lightning
 */
export default class CipMultiSelectDropdown extends LightningElement {

  @api msLabel = "";
  @api maxSelectedShow = 1;
  @api filterProperty;

  @track _selectedOptions = [];
  @api
  get selectedOptions() {
    return this._selectedOptions;
  }
  set selectedOptions(value) {
    this.setAttribute("selectedOptions", value);
    this._selectedOptions = value;

    this.onSelectedOptionsChange();
  }

  @track _msOptions = [];
  @api
  get msOptions() {
    return this._msOptions;
  }
  set msOptions(value) {
    this.setAttribute("msOptions", value);
    this._msOptions = value;
  }

  @api
  close(ignoreComponentUniqueId) {
    if (ignoreComponentUniqueId === this.uniqueId) {
      return;
    }

    //Close current drop down by removing slds class
    let dropdown = this.template.querySelector('.ms-picklist-dropdown');
    dropdown.classList.remove('slds-is-open');
  }

  initializationCompleted = false;
  uniqueId = createUniqueId();

  selectedItemsIds = [];
  selectedLabelDefault = "Select a value...";
  selectedLabel = "";
  _onClickComponentHandler;
  _onClickDocumentHandler;

  constructor() {
    super();
    this.selectedLabel = this.selectedLabelDefault;
  }

  renderedCallback() {
    if (!this.initializationCompleted) {
      //Marking initializationCompleted property true
      this.initializationCompleted = true;

      //Attaching component listener to detect clicks
      this.template.addEventListener("click", this._onClickComponentHandler = this.onClickComponent.bind(this));

      //Document listner to detect click outside multi select component
      document.addEventListener("click", this._onClickDocumentHandler = this.onClickDocument.bind(this));

      this.setPickListName();
    }
  }

  beforeUnloadHandler() {
    this.template.removeEventListener('click', this._onClickComponentHandler);
    document.removeEventListener('click', this._onClickDocumentHandler);
  }

  onSelectedOptionsChange() {
    this.selectedItemsIds = this.selectedOptions.map(x => parseInt(x.Id));

    let filters = {};
    filters[this.filterProperty] = this.selectedItemsIds;

    const filterChangeEvent = new CustomEvent('filterchange', {
      detail: { filters },
      bubbles: true
    });

    // Fire the custom event
    this.dispatchEvent(filterChangeEvent);
  }

  onClickComponent(event) {
    this.onClick(event, "component");
  }

  onClickDocument(event) {
    this.onClick(event, "document");
  }

  onClick(event, from) {
    //getting target element of mouse click
    var tempElement = event.target;

    var outsideComponent = true;
    //click indicator
    //1. Drop-Down is clicked
    //2. Option item within dropdown is clicked
    //3. Clicked outside drop-down
    //loop through all parent element
    while (tempElement) {

      if (tempElement.classList) {
        if (tempElement.classList.contains('ms-list-item')) {
          //2. Handle logic when picklist option is clicked
          //Handling option click in helper function
          if (from === 'component') {
            this.onOptionClick(event.target);
          }
          outsideComponent = false;
          break;
        } else if (tempElement.classList.contains('ms-dropdown-items')) {
          //3. Clicked somewher within dropdown which does not need to be handled
          //Break the loop here
          outsideComponent = false;
          break;
        } else if (tempElement.classList.contains('ms-picklist-dropdown')) {
          //1. Handle logic when dropdown is clicked
          if (from === 'component') {
            this.onDropDownClick(tempElement);
          }
          outsideComponent = false;
          break;
        } else if (tempElement.classList.contains('ms-clear-button-wrapper')) {
          return;
        }
      }

      //get parent node
      tempElement = tempElement.parentNode;
    }

    if (outsideComponent) {
      this.closeAllDropDown();
    }
    else {
      event.stopPropagation();
    }
  }

  onClearClick(event) {
    //clear selected options
    this.selectedOptions = [];
    //Clear check mark from drop down items
    this.rebuildPicklist();
    //Set picklist name
    this.setPickListName();

    event.stopPropagation();
  }

  rebuildPicklist() {
    var allSelectElements = this.template.querySelectorAll("li");
    Array.from(allSelectElements).forEach(function (node) {
      node.classList.remove('slds-is-selected');
    });
  }

  setPickListName() {
    //Set drop-down name based on selected value
    if (this.selectedOptions.length < 1) {
      this.selectedLabel = this.selectedLabelDefault;
    } else if (this.selectedOptions.length > this.maxSelectedShow) {
      this.selectedLabel = this.selectedOptions.length + ' Options Selected';
    } else {
      var selections = "";
      this.selectedOptions.forEach(option => {
        selections += option.Name + ',';
      });
      this.selectedLabel = selections.slice(0, -1);
    }
  }

  onOptionClick(ddOption) {
    //get clicked option id-name pair
    var clickedValue = {
      "Id": ddOption.closest("li").getAttribute('data-id'),
      "Name": ddOption.closest("li").getAttribute('data-name')
    };

    //Get all selected options
    var selectedOptions = this.selectedOptions;

    //Boolean to indicate if value is alredy present
    var alreadySelected = false;

    //Looping through all selected option to check if clicked value is already present
    selectedOptions.forEach((option, index) => {
      if (option.Id === clickedValue.Id) {
        //Clicked value already present in the set
        selectedOptions.splice(index, 1);
        //Make already selected variable true	
        alreadySelected = true;
        //remove check mark for the list item
        ddOption.closest("li").classList.remove('slds-is-selected');
      }
    });
    //If not already selected, add the element to the list
    if (!alreadySelected) {
      selectedOptions.push(clickedValue);
      //Add check mark for the list item
      ddOption.closest("li").classList.add('slds-is-selected');
    }

    //clone to trigger event change
    selectedOptions = JSON.parse(JSON.stringify(selectedOptions));
    this.selectedOptions = selectedOptions;

    //Set picklist label
    this.setPickListName();
  }

  closeAllDropDown() {
    //Close current drop down
    this.close();

    //send an event to parent to close other multi dropdown components
    const event = new CustomEvent('closeallmultidropdown', {
      detail: { fromUniqueId: this.uniqueId },
      bubbles: true
    });
    this.dispatchEvent(event);
  }

  onDropDownClick(dropDownDiv) {
    //Getting class list from component
    var classList = Array.from(dropDownDiv.classList);

    this.closeAllDropDown();
    if (!classList.includes("slds-is-open")) {
      //Open dropdown by adding slds class
      dropDownDiv.classList.add("slds-is-open");
    }
  }

  get isClearButtonVisible() {
    return this.selectedLabel !== this.selectedLabelDefault;
  }

  get isMsLabelVisible() {
    return this.msLabel !== "";
  }
}
