import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  //render all Products on site
  renderInMenu(){
    const thisProduct = this;

    //generate HTML based on template
    const generatedHTML = templates.menuProduct(thisProduct.data);

    //create element using utils.createElementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    //find menu container
    const menuContainer = document.querySelector(select.containerOf.menu);

    //add element to menu
    menuContainer.appendChild(thisProduct.element);
  }

  //search dom elements
  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  //Toggle class active(show options) to product if clicked
  initAccordion(){
    const thisProduct = this;
    
    //Start: click event listener to trigger
    thisProduct.accordionTrigger.addEventListener('click', function(){
      //prevent default action for event
      event.preventDefault();
      //toggle active class on element of thisProduct
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      //find all active products
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      //start loop: for each active product
      for(let activeProduct of activeProducts){
        //start: if the active product isn't the element of thisProduct
        if(activeProduct != thisProduct.element){
          //remove class active for the active product
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        //end: if the active product isn't the element of thisProduct
        }
      //end: loop: for each active product
      }
    //end: click event listener to trigger
    });
  }

  //Add event listeners to form, inputs and button
  initOrderForm(){
    const thisProduct = this;
    
    thisProduct.form.addEventListener('submit', function(){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    
    thisProduct.cartButton.addEventListener('click', function(){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  //Counting price of product
  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form); // eslint-disable-line no-unused-vars
    
    thisProduct.params = {};
    let price = thisProduct.data.price; // eslint-disable-line no-unused-vars
    
    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];

      for(let optionId in param.options){
        const option = param.options[optionId];
        
        const optSelected = formData.hasOwnProperty(paramId) && formData[paramId].includes(optionId);
        if(optSelected && !option.default){
          price += option.price;
        }
        else if(!optSelected && option.default){
          price -= option.price;
        }

        const allImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        if(optSelected){
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for(let image of allImages){
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        }
        else{
          for(let image of allImages){
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = thisProduct.price;
  }

  //Create instance of class AmountWidget and save it into Product property
  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  //create necessary properties name and amount and invoke method 'add' which add's product to basket
  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}