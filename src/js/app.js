import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames} from './settings.js';
import {Booking} from './components/Booking.js';

//Our program
const app = {
  //Method which creates all instances of Product
  initMenu: function(){
    const thisApp = this;

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  //Method which gets data from datasource object
  initData: function(){
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  //Method which create instance of Cart
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
 
  initPages(){
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    let pagesMatchingHash = [];
    if(window.location.hash.length > 2){
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page){
        return page.id == idFromHash;
      });
    }

    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    
    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        //id of clicked page
        const pageId = clickedElement.getAttribute('href').replace('#', '');
        
        thisApp.activatePage(pageId);
      });
    }
  },

  activatePage(pageId){
    const thisApp = this;

    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.getAttribute('id') == pageId);
    }

    window.location.hash = '#/' + pageId;
  },

  //Creates instance of Booking
  initBooking(){
    const thisApp = this;

    const bookingWidget = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingWidget);
  },

  //Method which run all of the methods
  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

//Run our program
app.init();


