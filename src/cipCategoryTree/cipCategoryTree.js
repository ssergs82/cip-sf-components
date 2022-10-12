import { LightningElement, api } from "lwc";
import { CipBaseUrl, getRequestParams } from "c/utils";

/**
 * Cip Category Tree component
 */
export default class CipCategoryTree extends LightningElement {

  @api categories;
  @api selectedCategoryId;

  constructor() {
    super();
    this.load();
  }

  load() {
    var that = this;

    let requestParams = getRequestParams();
    fetch(`${CipBaseUrl}/categories/selector`, requestParams)
      .then(response => {
        //console.log(response);
        if (response.ok) {
          return response.json();
        } else {
          throw Error(response);
        }
      })
      .then(categories => {
        //console.log(categories);

        let mappedCategories = that.categoriesMapping(categories);
        //console.log(mappedCategories);

        that.categories = mappedCategories;
        that.selectedCategoryId = mappedCategories[0].name;

        setTimeout(function () {
          that.onChange({ detail: { name: that.selectedCategoryId } });
        }, 0);
      })
      .catch(error => console.log(error));
  }

  categoriesMapping(categories) {
    let result = [];

    categories.forEach(function (category) {

      let mappedCategory = {
        name: category.value, //id
        label: category.label,//title
        items: []
      };

      result.push(mappedCategory);

      if (category.children && category.children.length > 0) {
        let kids = this.categoriesMapping(category.children);
        mappedCategory.items = kids;
      }
    }.bind(this));

    return result;
  }

  onChange(event) {
    this.selectedCategoryId = event.detail.name;

    let filters = {
      categoryId: parseInt(this.selectedCategoryId)
    };

    const filterChangeEvent = new CustomEvent('filterchange', {
      detail: { filters },
      bubbles: true
    });

    // Fire the custom event
    this.dispatchEvent(filterChangeEvent);
  }
}
