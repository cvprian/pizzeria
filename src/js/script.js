/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
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

        thisProduct.cartButton.addEventListener('click', function(){
          event.preventDefault();
          thisProduct.processOrder();
        });
      }
    }

    //Counting price of product
    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); // eslint-disable-line no-unused-vars
      
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
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
      console.log(price);
    }

    //Create instance of class AmountWidget and save it into Product property
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem)
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      })
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.input.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      console.log('AmountWidget', thisWidget);
      console.log('constructor arguments', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    //method to set new value of widget
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      // TODO: Add validation
      if(value != thisWidget.value && value >= settings.amountWidget.defaultMin && value <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    //add event listeners to widget elements
    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    //create instance of class event to submit our value to thisWidget
    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }
  //Our program
  const app = {
    //Method which creates all instances of Product
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    //Method which gets data from datasource object
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    //Method which run all of the methods
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  //Run our program
  app.init();
}
